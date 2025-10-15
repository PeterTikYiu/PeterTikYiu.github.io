import React from 'react';
import { motion } from 'framer-motion';

// Assuming you have translation data or i18n setup
const translations = {
  en: {
    cards: [
      { title: 'Work Experience', description: 'Full-Stack Engineer (Internship) at ladybirds ai.ltd' },
      { title: 'Education', description: 'Diploma of Higher Education Computer Science' },
      { title: 'Certifications', description: 'Google Advanced Data Analytics, Mathematics for ML, CS50' },
      { title: 'Skills', description: 'JavaScript, HTML5, CSS3, React, Node.js' }
    ]
  },
  zh: {
    cards: [
      { title: '工作经验', description: '全栈工程师（实习）在 ladybirds ai.ltd' },
      { title: '教育背景', description: '计算机科学高等教育文凭' },
      { title: '认证', description: 'Google 高级数据分析、机器学习数学、CS50' },
      { title: '技能', description: 'JavaScript, HTML5, CSS3, React, Node.js' }
    ]
  }
};

const CardList = ({ lang }) => {
  const cards = translations[lang]?.cards || [];

  return (
    <div className="card-list">
      {cards.map((card, index) => (
        <motion.div
          key={`${lang}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default CardList;