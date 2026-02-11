'use client';

import UploadPopup from "./components/UploadPopup";



export default function UploadPage() {
  const backgroundImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFm3MWJmrxpLw67cZ_GvjcabzwcWfcfAXjtOOp7jO-RYyAvSXUuG_Wk886rEiKr-4znLzovdeasQKePooso1inzU1AljmqKE97DB4wpwQw92EmbUiOt2efeRc94RkecISjaCyOCisQuUhGZsIvqeqzQAQzcT7vQxKXEk7axrqlVTrr41_O2f9aXX0Ax1RNIQ03hbPAEddMYtEizuDPd2x7IdmhLdEutZ9KprQMgDVVgbGJg3jNZ-TaVL4Prlps299Olq04qRuLj_c';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Documents</h1>
        <UploadPopup backgroundImage={backgroundImage} />
      </div>
    </div>
  );
}