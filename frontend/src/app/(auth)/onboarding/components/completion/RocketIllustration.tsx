"use client";

export default function RocketIllustration() {
  return (
    <div className="flex w-full justify-center mb-6">
      <div className="relative h-48 w-48">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* SVG illustration */}
          <svg
            fill="none"
            height="192"
            viewBox="0 0 192 192"
            width="192"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle className="dark:fill-gray-800" cx="96" cy="96" fill="#F3F4F6" r="96" />
            <path
              d="M123.958 55.5132C121.579 55.5132 119.624 57.4686 119.624 59.847C119.624 62.2255 121.579 64.1809 123.958 64.1809C126.336 64.1809 128.291 62.2255 128.291 59.847C128.291 57.4686 126.336 55.5132 123.958 55.5132Z"
              fill="#FACC15"
            />
            <path
              d="M72.3757 58.0194C71.2165 58.0194 70.2706 58.9653 70.2706 60.1246C70.2706 61.2838 71.2165 62.2297 72.3757 62.2297C73.535 62.2297 74.4809 61.2838 74.4809 60.1246C74.4809 58.9653 73.535 58.0194 72.3757 58.0194Z"
              fill="#FACC15"
            />
            <path
              className="dark:fill-gray-300"
              d="M110.19 146.402C110.19 146.402 121.782 135.243 127.362 129.663C132.096 124.929 133.255 117.844 133.255 112.264C133.255 93.8906 116.517 78.7188 96.0001 78.7188C75.4833 78.7188 58.7451 93.8906 58.7451 112.264C58.7451 117.844 59.9044 124.929 64.6384 129.663C70.2184 135.243 81.8101 146.402 81.8101 146.402H110.19Z"
              fill="#FFFFFF"
            />
            <path d="M96 42.6182C106.31 42.6182 114.655 50.9631 114.655 61.2727V93.8909C114.655 104.201 106.31 112.546 96 112.546C85.6904 112.546 77.3455 104.201 77.3455 93.8909V61.2727C77.3455 50.9631 85.6904 42.6182 96 42.6182Z" fill="#2463eb" />
            <path d="M96 112.545V146.401" stroke="#2463eb" strokeLinecap="round" strokeWidth="14" />
            <path d="M121.782 134.818L110.19 146.409" stroke="#2463eb" strokeLinecap="round" strokeWidth="14" />
            <path d="M70.2188 134.818L81.8105 146.409" stroke="#2463eb" strokeLinecap="round" strokeWidth="14" />
            <circle className="dark:fill-gray-300" cx="96" cy="77.1274" fill="#FFFFFF" r="14.6545" />
          </svg>
        </div>
      </div>
    </div>
  );
}
