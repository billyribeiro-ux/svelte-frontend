import type { User, UserPreferences } from '$types/user';
import { DEFAULT_PREFERENCES } from '$types/user';
import { getStorageItem, setStorageItem } from '$utils/local-storage';

const PREFS_KEY = 'sf-user-preferences';

class UserState {
	user = $state<User | null>(null);
	authenticated = $state(false);
	preferences = $state<UserPreferences>(getStorageItem(PREFS_KEY, DEFAULT_PREFERENCES));

	isLoggedIn = $derived(this.authenticated && this.user !== null);

	setUser(user: User) {
		this.user = user;
		this.authenticated = true;
		if (user.preferences) {
			this.preferences = user.preferences;
		}
	}

	clearUser() {
		this.user = null;
		this.authenticated = false;
	}

	updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
		this.preferences = { ...this.preferences, [key]: value };
		setStorageItem(PREFS_KEY, this.preferences);
	}

	setTheme(theme: 'dark' | 'light') {
		this.updatePreference('theme', theme);
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', theme);
		}
	}
}

export const userState = new UserState();
