// app/components/PerformanceChart.jsx
export default function PerformanceChart() {
  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm">
      <h3 className="font-bold mb-4 text-text-light dark:text-text-dark">
        Term Performance Trends
      </h3>
      <div className="h-80 bg-background-light dark:bg-background-dark rounded-lg flex items-center justify-center">
        <img 
          className="h-full w-full object-contain"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqLP3leEaVqmDOBHxyRlWcva4SuttY84PbQlsSRU-EYYQj6buVgNykKbdxwz04BrvZhfExn0UYIkrhsailIvlZVna_TEbARTNM-3FdOEpMMbYLtufeQ5PliRTElvTzqYhFLI5szzdfWqKKUHvzGMYO7Vp4lySVFV_EIvEuIC7llcEADHvHeS4yNIUwGSRnujtkyCEVzKidCLs-T9YpEg4qn5YD0_Qv8AxbDJfHvUJCzwbSztPc6bLHrqlvPv1dJuTngA3i-Ji-mcQ"
          alt="A line graph showing student performance trends across three terms, with scores improving from Term 1 to Term 3."
        />
      </div>
    </div>
  )
}