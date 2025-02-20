export default function catchAsync<T>(fn: (...args: any[]) => Promise<T>) {
    return async (...args: any[]): Promise<T > => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error("Database error:", error);
           throw error
        }
    };
}
