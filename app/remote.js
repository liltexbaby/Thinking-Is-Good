import React from 'react';

const remoteControl = ({ onButtonClick }) => {
  return (
    <div className="fixed bottom-4 right-4 w-64 h-32 bg-cover bg-center" style={{ backgroundImage: `url('./../public/img/remote.PNG')` }}>
      {/* Define clickable areas as buttons or divs */}
      <button className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent hover:bg-gray-800 hover:bg-opacity-25" style={{ left: '20%' }} onClick={() => onButtonClick('play')}>Play</button>
      <button className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent hover:bg-gray-800 hover:bg-opacity-25" style={{ left: '50%' }} onClick={() => onButtonClick('pause')}>Pause</button>
      <button className="absolute inset-x-0 bottom-0 mb-4 w-12 h-8 bg-transparent hover:bg-gray-800 hover:bg-opacity-25" style={{ left: '80%' }} onClick={() => onButtonClick('stop')}>Stop</button>
    </div>
  );
};

export default remoteControl;