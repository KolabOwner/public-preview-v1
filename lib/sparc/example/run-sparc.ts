import { SparcFramework } from '../core/framework';
import { DevelopmentMode, CommitFrequency } from '../constants';
import * as path from 'path';

async function main() {
  console.log('🚀 Starting SPARC Programmatic Execution Example\n');

  // Initialize the SPARC framework
  const sparc = new SparcFramework({
    configPath: '.claude/sparc-config.json',
    aiProvider: 'claude',
    redis: {
      host: 'localhost',
      port: 6379
    }
  });

  // Set up event listeners to monitor progress
  sparc.on('phase:start', ({ phase, progress }) => {
    console.log(`\n📋 Starting ${phase} phase (${progress.toFixed(0)}% overall)`);
  });

  sparc.on('phase:complete', ({ phase, result, progress }) => {
    console.log(`✅ Completed ${phase} phase (${progress.toFixed(0)}% overall)`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Tasks: ${result.tasks.length}`);
  });

  sparc.on('agent:decision', ({ agent, decision, taskId }) => {
    console.log(`🤖 [${agent}] Decision: ${decision.description}`);
    console.log(`   Rationale: ${decision.rationale}`);
  });

  sparc.on('agent:veto', ({ agent, task, reason }) => {
    console.log(`🚫 [${agent}] VETO on task ${task}: ${reason}`);
  });

  sparc.on('agent:consensus', ({ consensusId, approved, votes }) => {
    console.log(`🗳️  Consensus ${consensusId}: ${approved ? 'APPROVED' : 'REJECTED'}`);
  });

  sparc.on('task:start', ({ task }) => {
    console.log(`   ▶️  Starting task: ${task.description}`);
  });

  sparc.on('task:complete', ({ task, result }) => {
    console.log(`   ✓ Completed task: ${task.description}`);
  });

  sparc.on('error:occurred', ({ error, context }) => {
    console.error(`❌ Error in ${context}:`, error.message);
  });

  try {
    // Execute SPARC methodology
    const result = await sparc.execute({
      projectName: 'Hirable AI Resume Service',
      readmePath: 'coordination/docs/README.md',
      mode: DevelopmentMode.FULL,
      options: {
        parallel: true,
        testCoverage: 90,
        commitFrequency: CommitFrequency.PHASE,
        skipResearch: false,
        skipTests: false,
        verbose: true
      }
    });

    // Display final results
    console.log('\n\n📊 SPARC Execution Results:');
    console.log('===========================\n');
    
    console.log(`Success: ${result.success ? '✅ Yes' : '❌ No'}`);
    console.log(`Total Duration: ${(result.metrics.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Phases Completed: ${result.phases.filter(p => p.status === 'completed').length}/${result.phases.length}`);

    // Phase breakdown
    console.log('\nPhase Breakdown:');
    result.phases.forEach(phase => {
      const icon = phase.status === 'completed' ? '✅' : 
                   phase.status === 'failed' ? '❌' : '⏳';
      console.log(`  ${icon} ${phase.name}: ${phase.status} (${phase.duration}ms)`);
    });

    // Agent metrics
    console.log('\nAgent Performance:');
    Object.entries(result.metrics.agentMetrics).forEach(([agent, metrics]) => {
      console.log(`  ${agent}:`);
      console.log(`    - Tasks: ${metrics.tasksExecuted}`);
      console.log(`    - Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
      console.log(`    - Avg Time: ${metrics.averageExecutionTime.toFixed(0)}ms`);
      console.log(`    - Decisions: ${metrics.decisionsPerformed}`);
    });

    // Resource usage
    console.log('\nResource Usage:');
    console.log(`  API Calls: ${result.metrics.resourceUsage.apiCalls}`);
    console.log(`  Tokens Used: ${result.metrics.resourceUsage.tokensUsed.toLocaleString()}`);
    console.log(`  Cache Hit Rate: ${
      ((result.metrics.resourceUsage.cacheHits / 
        (result.metrics.resourceUsage.cacheHits + result.metrics.resourceUsage.cacheMisses)) * 100
      ).toFixed(1)}%`
    );

    // Errors if any
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors Encountered:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
      });
    }

    // Key artifacts generated
    console.log('\n📦 Key Artifacts Generated:');
    Object.keys(result.artifacts).forEach(key => {
      console.log(`  - ${key}`);
    });

    // Save detailed results
    const fs = await import('fs/promises');
    const outputPath = path.join(process.cwd(), 'sparc-execution-results.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Detailed results saved to: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ SPARC Execution Failed:', error);
    process.exit(1);
  } finally {
    // Clean shutdown
    await sparc.shutdown();
    console.log('\n👋 SPARC Framework shutdown complete');
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}