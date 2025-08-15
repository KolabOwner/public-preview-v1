#!/usr/bin/env python3
"""
Real-time JobSpy Scraper - Outputs jobs immediately as they're scraped
"""

import sys
import json
import time
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import logging

# Configure logging to stderr so it doesn't interfere with JSON output
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', stream=sys.stderr)
logger = logging.getLogger(__name__)

class RealTimeJobSpyScraper:
    def __init__(self):
        self.default_params = {
            'results_wanted': 25,  # Reduced from 25 for faster scraping
            'hours_old': 72,      # Reduced from 72 hours for much faster search
            'country_indeed': 'USA',
            'linkedin_fetch_description': False,  # MAJOR SPEED IMPROVEMENT - this takes 20+ seconds
            'distance': 10        # Reduced from 25 for faster search
        }
        self.processed_jobs = []
    
    def scrape_jobs_realtime(self, search_params: Dict[str, Any]) -> None:
        """
        Scrape jobs and output them in real-time as they become available
        """
        try:
            # Import jobspy here to catch import errors
            try:
                from jobspy import scrape_jobs
                self.emit_progress("JobSpy loaded successfully", 10)
            except ImportError as e:
                self.emit_error(f"JobSpy not installed: {e}")
                return
            
            # Merge user params with defaults - prioritize speed optimizations
            scrape_params = {**self.default_params, **search_params}
            scrape_params['site_name'] = ['linkedin']
            
            # Force speed optimizations
            scrape_params['linkedin_fetch_description'] = False  # Major speed boost
            scrape_params['hours_old'] = min(scrape_params.get('hours_old', 72), 72)  # Max 24 hours
            scrape_params['results_wanted'] = min(scrape_params.get('results_wanted', 25), 25)  # Max 25 jobs
            
            self.emit_progress("Starting optimized LinkedIn job search...", 20)
            logger.info(f"Speed-optimized search params: {scrape_params}")
            
            # Start the scraping process
            self.emit_progress("Connecting to LinkedIn (fast mode)...", 30)
            
            try:
                jobs_df = scrape_jobs(**scrape_params)
                self.emit_progress("Processing job results...", 80)
                
                if jobs_df is None or jobs_df.empty:
                    self.emit_progress("No jobs found", 100)
                    self.emit_final_result([], 0, True, "No jobs found for this search")
                    return
                
                # Convert DataFrame to list of dictionaries
                jobs_list = jobs_df.to_dict('records')
                self.emit_progress(f"Found {len(jobs_list)} jobs, processing...", 90)
                
                # Process all jobs at once (since JobSpy doesn't support streaming)
                transformed_jobs = []
                for i, job in enumerate(jobs_list):
                    transformed_job = self.transform_job(job)
                    if transformed_job:
                        transformed_jobs.append(transformed_job)
                        
                        # Emit jobs in small batches for progressive loading
                        if len(transformed_jobs) % 5 == 0 or i == len(jobs_list) - 1:
                            batch = transformed_jobs[-5:] if len(transformed_jobs) >= 5 else transformed_jobs
                            self.emit_job_batch(batch, len(transformed_jobs), len(jobs_list))
                            time.sleep(0.1)  # Small delay for better streaming UX
                
                self.emit_final_result(transformed_jobs, len(transformed_jobs), True, f"Successfully found {len(transformed_jobs)} jobs")
                
            except Exception as scraping_error:
                error_msg = f"JobSpy scraping failed: {str(scraping_error)}"
                logger.error(error_msg)
                self.emit_error(error_msg)
                
        except Exception as e:
            logger.error(f"Error in real-time scraper: {str(e)}")
            self.emit_error(f"Scraper error: {str(e)}")
    
    def emit_progress(self, message: str, progress: int) -> None:
        """Emit a progress update"""
        event = {
            'type': 'progress',
            'message': message,
            'progress': progress,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        print(f"STREAM:{json.dumps(event, default=self.json_serializer)}", flush=True)
    
    def emit_job_batch(self, jobs: List[Dict], total_processed: int, total_found: int) -> None:
        """Emit a batch of jobs"""
        event = {
            'type': 'jobs_batch',
            'jobs': jobs,
            'batch_size': len(jobs),
            'total_processed': total_processed,
            'total_found': total_found,
            'progress': min(100, int((total_processed / total_found) * 100)),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        print(f"STREAM:{json.dumps(event, default=self.json_serializer)}", flush=True)
    
    def emit_error(self, error_message: str) -> None:
        """Emit an error"""
        event = {
            'type': 'error',
            'error': error_message,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        print(f"STREAM:{json.dumps(event, default=self.json_serializer)}", flush=True)
    
    def emit_final_result(self, jobs: List[Dict], count: int, success: bool, message: str) -> None:
        """Emit the final result"""
        result = {
            'type': 'completed',
            'jobs': jobs,
            'count': count,
            'success': success,
            'message': message,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        print(f"FINAL:{json.dumps(result, default=self.json_serializer)}", flush=True)
    
    def transform_job(self, job: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Transform JobSpy job format to our Job interface"""
        try:
            job_id = job.get('id', '')
            if not job_id:
                return None
            
            # Parse date
            date_posted = job.get('date_posted', '')
            posted_at = datetime.now(timezone.utc)
            if date_posted:
                try:
                    if isinstance(date_posted, str):
                        posted_at = datetime.fromisoformat(date_posted.replace('Z', '+00:00'))
                    elif hasattr(date_posted, 'isoformat'):
                        posted_at = date_posted
                except:
                    posted_at = datetime.now(timezone.utc)
            
            # Map job type
            job_type_map = {
                'fulltime': 'FULL_TIME',
                'parttime': 'PART_TIME',
                'contract': 'CONTRACT',
                'internship': 'INTERNSHIP',
                'temporary': 'TEMPORARY'
            }
            
            raw_job_type = job.get('job_type', '').lower() if job.get('job_type') else ''
            job_type = job_type_map.get(raw_job_type, 'FULL_TIME')
            
            # Determine experience level
            job_level = job.get('job_level', '').lower()
            title_lower = job.get('title', '').lower()
            
            experience_level = 'MID_LEVEL'
            if any(word in title_lower for word in ['intern', 'entry', 'junior', 'graduate']):
                experience_level = 'ENTRY_LEVEL'
            elif any(word in title_lower for word in ['senior', 'lead', 'principal', 'staff']):
                experience_level = 'SENIOR_LEVEL'
            elif any(word in title_lower for word in ['director', 'vp', 'executive', 'chief']):
                experience_level = 'EXECUTIVE'
            elif 'internship' in job_level or 'intern' in title_lower:
                experience_level = 'INTERNSHIP'
            
            # Extract skills (handle None values safely)
            title_str = job.get('title') or ''
            desc_str = job.get('description') or ''
            skills = self.extract_skills_from_content(f"{title_str} {desc_str}")
            
            # Build company info
            company_name = job.get('company', 'Unknown Company')
            company_id = f"linkedin_company_{company_name.replace(' ', '_').lower()}"
            
            # Determine location
            location = job.get('location', {})
            if isinstance(location, dict):
                location_str = location.get('display_name', '') or location.get('city', '')
            else:
                location_str = str(location)
            
            # Check if remote
            is_remote = self.is_job_remote(
                job.get('title', ''),
                job.get('description', ''),
                location_str
            )
            
            # Handle salary data safely
            salary_min = job.get('min_amount')
            salary_max = job.get('max_amount')
            currency = job.get('currency', 'USD')
            
            # Clean salary data
            if salary_min is not None and (str(salary_min).lower() in ['nan', 'none'] or (isinstance(salary_min, float) and salary_min != salary_min)):
                salary_min = None
            if salary_max is not None and (str(salary_max).lower() in ['nan', 'none'] or (isinstance(salary_max, float) and salary_max != salary_max)):
                salary_max = None
            if currency is not None and (str(currency).lower() in ['nan', 'none'] or (isinstance(currency, float) and currency != currency)):
                currency = 'USD'
            
            # Build job object with optimized description handling
            description = job.get('description', '')
            if not description:
                # Generate a basic description since we're not fetching full descriptions for speed
                description = f"Join {company_name} as a {job.get('title', 'Unknown Title')}. Apply now to learn more about this opportunity."
            
            transformed_job = {
                'id': f"linkedin_{job_id}",
                'title': job.get('title', 'Unknown Title'),
                'description': description,
                'shortDescription': self.generate_short_description(job),
                'location': location_str,
                'type': job_type,
                'remote': is_remote,
                'salaryMin': salary_min,
                'salaryMax': salary_max,
                'currency': currency,
                'experienceLevel': experience_level,
                'skills': skills,
                'benefits': [],
                'externalUrl': job.get('job_url', ''),
                'isActive': True,
                'postedAt': posted_at.isoformat(),
                'createdAt': datetime.now(timezone.utc).isoformat(),
                'updatedAt': datetime.now(timezone.utc).isoformat(),
                'companyId': company_id,
                'company': {
                    'id': company_id,
                    'name': company_name,
                    'logoUrl': job.get('company_logo') or job.get('logo_photo_url') or job.get('company_logo_url'),
                    'website': job.get('company_url'),
                    'industry': job.get('company_industry'),
                    'createdAt': datetime.now(timezone.utc).isoformat(),
                    'updatedAt': datetime.now(timezone.utc).isoformat()
                },
                'isExternal': True,
                'source': 'LinkedIn',
                'externalId': job_id,
                'isCached': False
            }
            
            return transformed_job
            
        except Exception as e:
            logger.error(f"Error transforming job: {str(e)}")
            return None
    
    def generate_short_description(self, job: Dict[str, Any]) -> str:
        """Generate a short description for the job"""
        title = job.get('title', 'Unknown Title')
        company = job.get('company', 'Unknown Company')
        location = job.get('location', {})
        
        if isinstance(location, dict):
            location_str = location.get('display_name', '') or location.get('city', '')
        else:
            location_str = str(location)
        
        return f"{title} at {company}" + (f" in {location_str}" if location_str else "")
    
    def extract_skills_from_content(self, content: str) -> List[str]:
        """Extract technical skills from job title and description"""
        if not content:
            return ['Software Development']
        content_lower = content.lower()
        
        tech_skills = [
            'react', 'javascript', 'typescript', 'node.js', 'nodejs', 'python', 'java',
            'aws', 'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql',
            'redis', 'graphql', 'rest', 'api', 'html', 'css', 'angular', 'vue',
            'django', 'flask', 'spring', 'git', 'jenkins', 'ci/cd', 'terraform',
            'linux', 'agile', 'scrum', 'devops', 'machine learning', 'ai'
        ]
        
        found_skills = []
        for skill in tech_skills:
            if skill in content_lower:
                found_skills.append(skill.title())
        
        return found_skills if found_skills else ['Software Development']
    
    def is_job_remote(self, title: str, description: str, location: str) -> bool:
        """Check if job is remote based on title, description, and location"""
        remote_keywords = ['remote', 'work from home', 'wfh', 'telecommute', 'virtual']
        
        # Handle None values safely
        title_safe = title or ''
        description_safe = description or ''
        location_safe = location or ''
        
        full_text = f"{title_safe} {description_safe} {location_safe}".lower()
        return any(keyword in full_text for keyword in remote_keywords)
    
    def json_serializer(self, obj):
        """Custom JSON serializer to handle edge cases"""
        if obj is None:
            return None
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, float):
            if obj != obj or obj == float('inf') or obj == float('-inf'):
                return None
        if isinstance(obj, str) and str(obj).lower() in ['nan', 'none', 'null']:
            return None
        return str(obj)


def main():
    """Main function to handle command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python jobspy-realtime-scraper.py '<json_params>'")
        sys.exit(1)
    
    try:
        params_json = sys.argv[1]
        params = json.loads(params_json)
        
        # Initialize real-time scraper
        scraper = RealTimeJobSpyScraper()
        
        # Start real-time scraping
        scraper.scrape_jobs_realtime(params)
        
    except json.JSONDecodeError:
        print(f"ERROR:{json.dumps({'error': 'Invalid JSON parameters', 'success': False})}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR:{json.dumps({'error': str(e), 'success': False})}")
        sys.exit(1)


if __name__ == "__main__":
    main()