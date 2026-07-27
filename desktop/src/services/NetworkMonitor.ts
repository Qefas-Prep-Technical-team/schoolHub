export class NetworkMonitor {
  private static instance: NetworkMonitor | null = null;
  private onlineStatus: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  private constructor() {
    window.addEventListener("online", () => this.handleStatusChange(true));
    window.addEventListener("offline", () => this.handleStatusChange(false));
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  public get isOnline(): boolean {
    return this.onlineStatus;
  }

  public addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.onlineStatus); // Immediate invocation with current state
    return () => this.listeners.delete(listener);
  }

  private handleStatusChange(isOnline: boolean): void {
    this.onlineStatus = isOnline;
    console.log(`[NetworkMonitor] Connection state changed: ${isOnline ? "ONLINE" : "OFFLINE"}`);
    this.listeners.forEach((listener) => listener(isOnline));
  }
}
