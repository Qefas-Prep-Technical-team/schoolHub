'use client';

import { useState } from 'react';
import { Document, ViewMode } from './components/types';
import DocumentsHeader from './components/DocumentsHeader';
import Toolbar from './components/Toolbar';
import DocumentGrid from './components/DocumentGrid';


const DocumentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [documents] = useState<Document[]>([
    {
      id: 1,
      title: 'Algebra Chapter 5 Review',
      type: 'PDF',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu8p4eyK4UGVHlbBTj7gswROwauolumxBA-VKQWc2o7N29ET-3vHsN83wPbSMEdtqfzf8_pZyWM-edb7toCEddh61pVgHEJaQ2OCGTyuc87TKpTLFlV6GQ8hTXdVOMejh2xLcthM6xPsZfEXnadgveLtEJvCu4eCNodWM4r1llrc5EQd0zFc1OpiDYUW8F3g5ohrUrFfoeo9Y_MXqVYnojjNypcQg6X35IGA-LOHcHZXGSiFb6IK1Y365pe7W5_mGCb1RAPLXeYB8',
      modifiedDate: '3 days ago'
    },
    {
      id: 2,
      title: 'Photosynthesis Slides',
      type: 'Slides',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD9FEYkd3E2uQdIyUSFgJlXL7UNKLoRxBR8t96rlHC2fBag7ELva1VACY7KVEbwakM4XPAc9lzQ03hcIXeGRefnuXyaRsCBPxkGYz81zVfvebDVNRyLx75CCmcats0kHNRvTsEciW4ko9tgqXkk3ceWiPHZElzG9CAo05Jx3tctAci-YWt3ACwYBmWu9e1U4fyK5FqhVw4vAF5alSvPfpbgfHtOTbBaXNg1Z5WVZDEnyoMGQ4JxIuXQahdcWq_clNmeY3G9e-_aMM',
      modifiedDate: '1 week ago'
    },
    {
      id: 3,
      title: 'History Worksheet - Unit 3',
      type: 'Worksheet',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMl8sDCbnIgIUVUCYNyukb0X5TcYcE-n9OL0el0jwc6Jjrmt5fYgKPKxlkyaHf7rzEq7ZNKNznoax7ZwNt6C_zgq714ajLz133Va1Fu2su23N0xaUk5lqRJS8bPTGm7UJ4Cyqcq7uDRlrCjp32mlqGs0gAh_QuW5Hc5iVHVqi9LyXZfYoINcBKElqjkYDlLWwUiJH_Y4n499Obmf43EAEb5LTF5kKf2R-Z_JVJkL48UDUjl2tZB8upSxxfyA6DTS0ntUaXUC4ELuE',
      modifiedDate: 'Oct 20'
    },
    {
      id: 4,
      title: 'Physics Past Questions',
      type: 'Past Questions',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvCYcfkQCl6MmoZfxu0nfZe3w8BoMRm-77ABgUuVgRKifMyjvtLHsO0ckq2iH5dViTRGcwcXofVc3y5MhqSVxosLQz6zIazA8TnC9D7sT_0oLTlESstRwRNMsj9tb1dKSBXm9PcvbgGKobbPiitw8Os1Xbxju5lRHRGssUB65dEDRNZxqVGpC11KChot7-sKCgnBQ_qvhiE50R8NYCb8cElgNrCAZ9QVv_Lc1drjbBdpEbpXDnt4StI29p5NnnNSVuxnVeaQnAv28',
      modifiedDate: 'Oct 18'
    },
    {
      id: 5,
      title: 'Geometry Notes',
      type: 'Notes',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQQMAIg1RyoB8uRGtAxnYsDlOT1ofqMUbCmJpM96fo9UAVoSjvxaeq27jFidhNWOiI3tV7UVgufv9_HGzbiM8lmxGDxJb6TBGUNdbaq6sl3-2Ckb_oZpOlPGf1Ux-4zc5TXJ-L7LCeGSnv9nXjpQEn_qk6qNE7IHjXjroVGbCz4b99r3aOo8R4vOpiSEcJPnLx_SV9mXdhVcXMYESQ97reBdG0t3AmIVVywwWe_pCEwPnt5xtYznCUFGaCtnwduIcN3tE49fupn_Q',
      modifiedDate: 'Oct 15'
    },
    {
      id: 6,
      title: 'Chemistry Lab Report Guide',
      type: 'PDF',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuesbuBUroo-8tKKtHsEYOdDvLupbcMaCdLmT9haabk9u6BktYYTdJgjApwZ49KkksvsAazCYOgdvXU7ggU71F1SOweQq5rgGJTgEWTu70cdkjG3gJbCnDYLRi_PceYE-Jpsrs-Kbb917aHOjtf-jhYlgVALCTm78XZSXHBTdv3564azaWnjT1RqfwgKNrU1STsbI5vCaZw_BK6RmlqBULPu518tbP3_NSrFSuW25Y_85qJjTnGgV_HKNaA6KvBDoxVJ-05ueeqkM',
      modifiedDate: 'Oct 12'
    },
    {
      id: 7,
      title: 'Essay Prompts',
      type: 'Worksheet',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvlkbJHwOY9AGWlr7qFCibf5egy_7QAMVbWUyGFi7OihSoOhzWF--d27mOW0OsnCZdl21LA0azJArEIieVz5T70eKIhXPJRE1SkbIk6BTQZAX_Tl8YB6U9L9ovQ-qeMkZUjCLOPV_PjBkl-nx3EtjP9m1ZHr6jwIFcbzd__Q-ieD7IV0gHlGGcXhlg9NN-iwvTJWEPVTUhvtOdwl_LNlC5vZlexMu8XaBjQg3-LkNUleunTDNPSFpObEy2of7OGgt_TXVRSgui2GM',
      modifiedDate: 'Oct 10'
    },
    {
      id: 8,
      title: 'Civics Chapter 1 Notes',
      type: 'Notes',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDwDrllIYcAu_0vvg7BTabZrzJbXePfYzjYSkxaQOmOrB_Z8TPiFs9Z_Ph1UWOCQ34T0M726PDcsTeVm0XGuOMbsQpqjEW2jzBNClQabLmYsUIgapxzWhi0wAngAfsw9lj1oGXI3kWPuzhPo7xyFapSG3nwfDZwZsSX3-7WqFIUMkw3d9IA8JAKZLrYnhpOZrpjlEv2H7Ghnk5NfzTYFkJm2_GUqZiGBy-dhNd3oSVLUbY7b8FNHkfs3W4-I-lH2zxLWI-7Ee6pqM',
      modifiedDate: 'Oct 05'
    }
  ]);

  const handleUpload = () => {
    console.log('Upload document clicked');
    // Implement upload logic
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <DocumentsHeader onUpload={handleUpload} />
      <Toolbar 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <DocumentGrid 
        documents={documents}
        viewMode={viewMode}
      />
    </div>
  );
};

export default DocumentsPage;