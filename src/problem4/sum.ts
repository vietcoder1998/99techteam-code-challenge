// MAX_SAFE_SUM_N is the largest integer n such that the sum 1 + 2 + ... + n <= Number.MAX_SAFE_INTEGER
const MAX_SAFE_SUM_N = Math.floor(
	(-1 + Math.sqrt(1 + 8 * Number.MAX_SAFE_INTEGER)) / 2
);

export function sum_to_n_a(n: number): number {
	if (n < 1) {
		return 0;
	}
	if (n > MAX_SAFE_SUM_N) {
		throw new Error(`n exceeds maximum safe value: ${MAX_SAFE_SUM_N}`);
	}
	return n * (n + 1) / 2;
}

export function sum_to_n_b(n: number): number {
	if (n > MAX_SAFE_SUM_N) {
		throw new Error(`n exceeds maximum safe value: ${MAX_SAFE_SUM_N}`);
	}
	let total = 0;
	for (let i = 1; i <= n; i++) {
		total += i;
	}
	return total;
}

export function sum_to_n_c(n: number): number {
	if (n < 1) {
		return 0;
	}
	if (n > MAX_SAFE_SUM_N) {
		throw new Error(`n exceeds maximum safe value: ${MAX_SAFE_SUM_N}`);
	}
	return n + sum_to_n_c(n - 1);
}