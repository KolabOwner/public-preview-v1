// app/dashboard/ai-interview/page.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Video, Brain, Award, Clock, Mic, Camera, BarChart3, Target, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';

export default function AIInterviewPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            AI Interview Preparation
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master your interview skills with AI-powered practice sessions, real-time feedback, and personalized coaching.
          </p>
          
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-4 py-2 text-sm font-semibold">
            🚧 Coming Soon - Currently Under Development
          </Badge>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Mock Interviews</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Practice with AI-driven mock interviews tailored to your target role and industry.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Role-specific questions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Real-time feedback
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Unlimited practice
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Performance Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Get detailed insights on your interview performance with AI-powered analysis.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Speech analysis
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Confidence scoring
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Improvement tracking
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personalized Coaching */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Personalized Coaching</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Receive tailored coaching recommendations based on your strengths and areas for improvement.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Custom study plans
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Skill-based tips
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Progress milestones
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Interview Types Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Technical Interviews */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Technical Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Practice coding challenges, system design, and technical problem-solving with AI evaluation.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Coding Practice</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">System Design</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Behavioral Interviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Behavioral Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Master the STAR method and practice common behavioral questions with personalized feedback.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">STAR Method</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Soft Skills</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Development Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6">
            <Clock className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Revolutionary AI Interview Training
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            We're developing an advanced AI interview preparation platform that will provide realistic practice sessions, 
            detailed performance analysis, and personalized coaching to help you ace any interview.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Video className="w-4 h-4 mr-2" />
              Video Analysis
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Mic className="w-4 h-4 mr-2" />
              Voice Coaching
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              AI Feedback
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              Skill Tracking
            </Badge>
          </div>
          
          <Button 
            disabled 
            className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          >
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </Button>
        </motion.div>

        {/* Feature Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Video Practice</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Record and review your interview responses</p>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Performance Metrics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress and improvements</p>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Award className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Skill Assessment</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Evaluate and improve your interview skills</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}