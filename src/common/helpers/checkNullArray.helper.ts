export const checkNullArrayHelper = (arrayData: Array<any> | null): Array<any> | null => {
	if (arrayData.length === 0) return null;
	return arrayData;
};
