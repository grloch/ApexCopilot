export class CaseInsensitiveMap<TKey, TVal> extends Map<TKey, TVal> {
	private keysMap = new Map<TKey, TKey>();

	constructor(iterable?: Iterable<[TKey, TVal]>) {
		super();
		if (iterable) {
			for (const [key, value] of iterable) {
				this.set(key, value);
			}
		}
	}

	clear(): void {
		this.keysMap.clear();
		super.clear();
	}

	delete(key: TKey): boolean {
		const keyLowerCase = typeof key === 'string' ? (key.toLowerCase() as any as TKey) : key;
		this.keysMap.delete(keyLowerCase);

		return super.delete(keyLowerCase);
	}

	*entries(): IterableIterator<[TKey, TVal]> {
		const keys = this.keysMap.values();
		const values = super.values();
		for (let i = 0; i < super.size; i++) {
			yield [keys.next().value, values.next().value];
		}
	}

	get(key: TKey): TVal | undefined {
		return typeof key === 'string' ? super.get(key.toLowerCase() as any as TKey) : super.get(key);
	}

	has(key: TKey): boolean {
		return typeof key === 'string' ? super.has(key.toLowerCase() as any as TKey) : super.has(key);
	}

	keys(): IterableIterator<TKey> {
		return this.keysMap.values();
	}

	set(key: TKey, value: TVal): this {
		const keyLowerCase = typeof key === 'string' ? (key.toLowerCase() as any as TKey) : key;
		this.keysMap.set(keyLowerCase, key);

		return super.set(keyLowerCase, value);
	}
}
