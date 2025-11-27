// app/components/ProfileHeader.jsx
export default function ProfileHeader() {
  return (
    <div className="flex p-4 @container bg-white dark:bg-[#1C252E] rounded-xl shadow-sm mb-6">
      <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
        <div className="flex gap-4">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-24 w-24 sm:min-h-32 sm:w-32"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIhop3QhxiDJMRv7XuJgjAh3AVuSlwHF0v9gLREb5Gc7tTP4_VoDY9NM4QXA2_vpTaoYZVvlbV16Lrd5Rldz0r3Id3u3dNEbdSgzfv6Fy75CTrpkhL1Fc-G7s4h4H6dErXQfCjHNzveivduFkEfLeVTOMxI3MjfzaNWWETnExOQqhotwnlmge0BXHC8BPUvwY3Z-Ftg18mvMf95oQ0afxZSxiHbprMMe1A6IVl-clxRqnP61MP__o0s910zHWmegjXYZO8SF0cSPU")' }}
          ></div>
          <div className="flex flex-col justify-center">
            <p className="text-[#0e141b] dark:text-slate-200 text-[22px] font-bold leading-tight tracking-[-0.015em]">Eleanor Vance</p>
            <p className="text-[#4e7397] dark:text-slate-400 text-base font-normal leading-normal">Student ID: S12345</p>
            <p className="text-green-600 dark:text-green-400 text-base font-normal leading-normal flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Active
            </p>
          </div>
        </div>
        
        <div className="flex w-full max-w-[480px] gap-3 @[480px]:w-auto">
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-700 text-[#0e141b] dark:text-slate-200 text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto hover:bg-slate-200 dark:hover:bg-slate-600">
            <span className="truncate">Edit Profile</span>
          </button>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto hover:bg-primary/90">
            <span className="truncate">More Actions</span>
          </button>
        </div>
      </div>
    </div>
  )
}