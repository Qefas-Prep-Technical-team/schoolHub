$pages = @(
    "c:\Users\HP\Documents\GitHub\Qefas Project\schoolHub\frontend\src\app\dashboard\admin\notifications\page.tsx",
    "c:\Users\HP\Documents\GitHub\Qefas Project\schoolHub\frontend\src\app\dashboard\teacher\notifications\page.tsx",
    "c:\Users\HP\Documents\GitHub\Qefas Project\schoolHub\frontend\src\app\dashboard\student\notifications\page.tsx",
    "c:\Users\HP\Documents\GitHub\Qefas Project\schoolHub\frontend\src\app\dashboard\parent\notifications\page.tsx"
)

foreach ($page in $pages) {
    if (Test-Path $page) {
        $content = Get-Content -Path $page -Raw -Encoding UTF8

        $targetIconDiv = @'
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center transition-all",
                      !n.isRead ? "bg-blue-400 text-white shadow-md shadow-blue-400/30" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}>
'@
        $replacementIconDiv = @'
                    <div className={cn(
                      "p-3 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center transition-all",
                      !n.isRead 
                        ? (n.meta as any)?.priority === 'URGENT' 
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/30" 
                            : (n.meta as any)?.priority === 'HIGH' 
                                ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                                : "bg-blue-400 text-white shadow-md shadow-blue-400/30"
                        : (n.meta as any)?.priority === 'URGENT'
                            ? "bg-rose-50 dark:bg-rose-950/20 text-rose-400 border border-rose-200 dark:border-rose-900/50"
                            : (n.meta as any)?.priority === 'HIGH'
                                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-400 border border-amber-200 dark:border-amber-900/50"
                                : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                    )}>
'@
        $content = $content.Replace($targetIconDiv, $replacementIconDiv)
        
        $targetBadge = @'
                          {!n.isRead && <Badge className="bg-blue-400 text-white text-[8px] font-black tracking-widest uppercase py-0.5 px-1.5 shadow-sm hover:bg-blue-500">New</Badge>}
'@
        $replacementBadge = @'
                          {!n.isRead && <Badge className="bg-blue-400 text-white text-[8px] font-black tracking-widest uppercase py-0.5 px-1.5 shadow-sm hover:bg-blue-500">New</Badge>}
                          {(n.meta as any)?.priority && (n.meta as any)?.priority !== 'NORMAL' && (
                            <Badge className={cn("text-[8px] font-black tracking-widest uppercase py-0.5 px-1.5 shadow-sm", (n.meta as any)?.priority === 'URGENT' ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-amber-500 text-white hover:bg-amber-600')}>
                              {(n.meta as any).priority}
                            </Badge>
                          )}
'@
        $content = $content.Replace($targetBadge, $replacementBadge)
        
        Set-Content -Path $page -Value $content -Encoding UTF8
    }
}
