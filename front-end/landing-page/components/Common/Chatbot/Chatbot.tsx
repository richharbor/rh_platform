// 'use client'

// import { useEffect } from 'react';
// import Rhinontech from '@rhinon/botsdk';

// export default function Chatbot() {
//   useEffect(() => {
//     Rhinontech({
//       app_id: 'EDPBB7'
//     });
//   }, []);

//   return null;
// }
'use client';

import { useEffect } from 'react';

export default function Chatbot() {
  useEffect(() => {
    (async () => {
      const Rhinontech = (await import('@rhinon/botsdk')).default;

      Rhinontech({
        app_id: "EDPBB7",
      });

      
    })();
  }, []);

  return <div id="chatbot-container"></div>;
}

