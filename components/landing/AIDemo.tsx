import React from 'react';
import { motion } from 'framer-motion';

export const AIDemo = () => {
  const [text, setText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const textRef = React.useRef(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const demoText =
    'Experienced software engineer with 5+ years developing scalable web applications...';

  React.useEffect(() => {
    if (isTyping) {
      textRef.current = 0;
      intervalRef.current = setInterval(() => {
        setText(demoText.slice(0, textRef.current));
        textRef.current++;

        if (textRef.current > demoText.length) {
          setIsTyping(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 50);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isTyping]);

  return (
    <div className="relative max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-gray-900 rounded-2xl p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <div className="ml-4 text-gray-400 text-sm">AI Resume Builder</div>
        </div>

        {/* AI Output */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              AI
            </div>
            <div className="flex-1">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 font-mono text-sm">
                  {text}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => {
              setText('');
              setIsTyping(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Generate Content
          </button>
        </div>
      </motion.div>
    </div>
  );
};
