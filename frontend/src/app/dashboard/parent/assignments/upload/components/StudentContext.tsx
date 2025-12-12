import Image from 'next/image'

export default function StudentContext() {
  return (
    <div className="flex items-center p-4 rounded-xl bg-card-light dark:bg-card-dark border border-[#e8ebf3] dark:border-gray-800 shadow-sm">
      <div className="relative size-12">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCygtdytJRds4EU9lx5cRNGRoDcXkNG0lZVWqiVD-AMkh-PGYK4UIUDudV_qJJmoqBaFJyvL9-84wiJxAumH2393j-oXFt5XBKjAor6cXAsKrWs0rGmbc24PYZBevYCLWr2rhKQZneIysDAR7IFBs-x1Cn2ORWHiFXRtQ2vVqRTk926Sgv_hlgqZimfSr6TBy8ppElmfq1yxAvcV1jrHkHcUUiX2iLgEjXRgZUHr9Web1Y-bUkqeqcG67_zWSqzHgiJXiM1WcWi34"
          alt="Portrait of student Alex Smith smiling"
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="ml-4">
        <p className="text-sm text-text-sec-light dark:text-text-sec-dark font-medium">
          Submitting for
        </p>
        <p className="text-lg font-bold leading-none">
          Alex Smith 
          <span className="text-sm font-normal text-text-sec-light dark:text-text-sec-dark ml-1">
            (ID: 459920)
          </span>
        </p>
      </div>
    </div>
  )
}