export interface MainRepositoryInterface<MODEL, TYPE> {
	create(data: TYPE): Promise<MODEL>;
	find(id: string): Promise<MODEL | null>;
	delete(model: MODEL): Promise<void>;
	deleteAll(): Promise<void>;
}
