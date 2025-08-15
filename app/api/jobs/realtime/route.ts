// Real-time Jobs API - True progressive loading without mock data
import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { JobType, ExperienceLevel } from '@/types/job-board.types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const searchQuery = searchParams.get('q') || 'software engineer';
  const location = searchParams.get('location') || 'United States';
  const jobType = searchParams.get('type') as JobType | null;
  const experienceLevel = searchParams.get('level') as ExperienceLevel | null;
  const remote = searchParams.get('remote') === 'true';
  const limit = parseInt(searchParams.get('limit') || '25');

  console.log('🚀 Starting real-time job stream:', { searchQuery, location, limit });

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send immediate connection confirmation
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({
          type: 'connected',
          message: 'Job stream connected',
          query: searchQuery,
          location,
          timestamp: new Date().toISOString()
        })}\n\n`)
      );
      
      // Start the streaming process immediately
      startStreaming(controller);
    }
  });

  async function startStreaming(controller: ReadableStreamDefaultController<Uint8Array>) {
    let isControllerClosed = false;
    
    const safeEnqueue = (data: Uint8Array) => {
      if (!isControllerClosed) {
        try {
          controller.enqueue(data);
        } catch (error) {
          console.warn('Controller already closed, skipping enqueue');
          isControllerClosed = true;
        }
      }
    };
    
    const safeClose = () => {
      if (!isControllerClosed) {
        try {
          controller.close();
          isControllerClosed = true;
        } catch (error) {
          console.warn('Controller already closed');
          isControllerClosed = true;
        }
      }
    };

    try {
      // Prepare optimized JobSpy parameters for maximum speed
      const jobspyParams = {
        search_term: searchQuery,
        location,
        results_wanted: Math.min(limit, 25),  // Allow up to 25 jobs as requested
        hours_old: 72,                        // Jobs from last 3 days
        distance: 10,                         // Smaller radius for speed
        is_remote: remote,
        site_name: ['linkedin'],
        linkedin_fetch_description: false,    // MAJOR SPEED BOOST - skip descriptions
        country_indeed: 'USA'
      };

      // Start Python script
      const pythonScriptPath = path.join(process.cwd(), 'lib', 'jobspy-realtime-scraper.py');
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      
      console.log('🐍 Starting real-time Python scraper...');
      
      const pythonProcess = spawn(pythonCommand, [pythonScriptPath, JSON.stringify(jobspyParams)], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let buffer = '';
      let finalDataSent = false;

      // Process stdout line by line for real-time streaming
      pythonProcess.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (line.trim() && !isControllerClosed) {
            try {
              if (line.startsWith('STREAM:')) {
                const streamData = JSON.parse(line.substring(7));
                safeEnqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: streamData.type,
                    ...streamData,
                    timestamp: streamData.timestamp || new Date().toISOString()
                  })}\n\n`)
                );
              } else if (line.startsWith('FINAL:') && !finalDataSent) {
                const finalData = JSON.parse(line.substring(6));
                finalDataSent = true;
                safeEnqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'completed',
                    ...finalData,
                    timestamp: finalData.timestamp || new Date().toISOString()
                  })}\n\n`)
                );
                // Close after final data
                setTimeout(() => safeClose(), 100);
                return;
              } else if (line.startsWith('ERROR:')) {
                const errorData = JSON.parse(line.substring(6));
                safeEnqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'error',
                    ...errorData,
                    timestamp: new Date().toISOString()
                  })}\n\n`)
                );
                setTimeout(() => safeClose(), 100);
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse Python output:', line.substring(0, 100));
            }
          }
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const stderr = data.toString();
        console.log('JobSpy log:', stderr);
        
        // Send JobSpy progress updates
        if ((stderr.includes('INFO') || stderr.includes('finished scraping')) && !isControllerClosed) {
          safeEnqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'log',
              message: stderr.trim(),
              timestamp: new Date().toISOString()
            })}\n\n`)
          );
        }
      });

      // Handle process completion
      const processPromise = new Promise<void>((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ JobSpy process completed successfully');
            resolve();
          } else {
            console.error('❌ JobSpy process failed with code:', code);
            reject(new Error(`JobSpy failed with code ${code}`));
          }
        });

        pythonProcess.on('error', (error) => {
          console.error('❌ JobSpy process error:', error);
          reject(error);
        });

        // Timeout after 90 seconds
        setTimeout(() => {
          pythonProcess.kill('SIGTERM');
          reject(new Error('JobSpy process timeout after 90 seconds'));
        }, 90000);
      });

      try {
        await processPromise;
        
        // Only send stream_ended if we haven't sent final data and controller isn't closed
        if (!finalDataSent && !isControllerClosed) {
          safeEnqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'stream_ended',
              message: 'Job search stream completed',
              timestamp: new Date().toISOString()
            })}\n\n`)
          );
        }
        
      } catch (error) {
        if (!isControllerClosed) {
          safeEnqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Process failed',
              timestamp: new Date().toISOString()
            })}\n\n`)
          );
        }
      } finally {
        safeClose();
      }
        
    } catch (error) {
      console.error('Stream error:', error);
      if (!isControllerClosed) {
        safeEnqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream error',
            timestamp: new Date().toISOString()
          })}\n\n`)
        );
      }
      safeClose();
    }
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}