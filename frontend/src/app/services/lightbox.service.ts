import { Injectable, signal } from '@angular/core';

export interface LightboxData {
    url: string;
    type: 'IMAGE' | 'VIDEO';
}

@Injectable({ providedIn: 'root' })
export class LightboxService {
    readonly isOpen = signal(false);
    readonly data = signal<LightboxData | null>(null);

    open(url: string, type: 'IMAGE' | 'VIDEO') {
        this.data.set({ url, type });
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
        this.data.set(null);
    }
}
