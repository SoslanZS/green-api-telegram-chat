import { useState, type FormEvent } from 'react';
import { GreenApiError, getDefaultApiUrl, greenApi } from '@/api/green-api';
import type { Credentials } from '@/types';
import './Form.scss';

type Props = {
	onLogin: (credentials: Credentials) => void;
};

const getErrorMessage = (e: unknown): string => {
	if (e instanceof GreenApiError && (e.status === 401 || e.status === 403))
		return 'Неверный idInstance или apiTokenInstance';
	if (e instanceof GreenApiError)
		return `GREEN-API вернул ошибку ${e.status}. Проверьте данные и apiUrl`;
	// fetch throws TypeError when the host is unreachable or CORS fails
	if (e instanceof TypeError)
		return 'Не удалось подключиться к GREEN-API. Проверьте apiUrl и интернет';
	if (e instanceof Error && e.message)
		return e.message;

	return 'Что-то пошло не так';
};

const LoginForm = ({ onLogin }: Props) => {
	// variables
	const [idInstance, setIdInstance] = useState('');
	const [apiTokenInstance, setApiTokenInstance] = useState('');
	// Empty = default host derived from idInstance
	const [apiUrl, setApiUrl] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const isFilled = Boolean(idInstance.trim() && apiTokenInstance.trim());

	// functions
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isFilled || isLoading)
			return;

		const credentials: Credentials = {
			idInstance: idInstance.trim(),
			apiTokenInstance: apiTokenInstance.trim(),
			apiUrl: apiUrl.trim(),
		};

		setError('');
		setIsLoading(true);
		try {
			// Validates credentials and checks that the Telegram account is connected
			const { stateInstance } = await greenApi.getStateInstance(credentials);
			if (stateInstance !== 'authorized')
				throw new Error(`Инстанс не авторизован (состояние: ${stateInstance}). Авторизуйте аккаунт Telegram в личном кабинете GREEN-API`);

			onLogin(credentials);
		}
		catch (e) {
			setError(getErrorMessage(e));
			setIsLoading(false);
		}
	};

	return (
		<div className="login-form">
			<form className="login-form__card" onSubmit={handleSubmit}>
				<div className="login-form__card-logo" />
				<h1 className="login-form__card-title">Вход в Telegram Chat</h1>
				<p className="login-form__card-text">
					Введите данные инстанса из
					{' '}
					<a
						className="login-form__card-link"
						href="https://console.green-api.com/"
						target="_blank"
						rel="noreferrer"
					>
						личного кабинета GREEN-API
					</a>
				</p>

				<label className="login-form__card-field">
					<span className="login-form__card-label">idInstance</span>
					<input
						className="g-input"
						value={idInstance}
						onChange={(event) => setIdInstance(event.target.value)}
						inputMode="numeric"
						placeholder="4100000000"
						autoComplete="off"
					/>
				</label>

				<label className="login-form__card-field">
					<span className="login-form__card-label">apiTokenInstance</span>
					<input
						className="g-input"
						value={apiTokenInstance}
						onChange={(event) => setApiTokenInstance(event.target.value)}
						type="password"
						placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd..."
						autoComplete="off"
					/>
				</label>

				<details className="login-form__card-advanced">
					<summary className="login-form__card-advanced-toggle">Дополнительно</summary>
					<p className="login-form__card-hint">Оставьте пустым, если apiUrl в личном кабинете совпадает с подсказкой</p>
					<label className="login-form__card-field">
						<span className="login-form__card-label">apiUrl</span>
						<input
							className="g-input"
							value={apiUrl}
							onChange={(event) => setApiUrl(event.target.value)}
							placeholder={getDefaultApiUrl(idInstance)}
							autoComplete="off"
						/>
					</label>
				</details>

				{error && <p className="g-error">{error}</p>}

				<button
					className="g-button login-form__card-submit"
					type="submit"
					disabled={!isFilled || isLoading}
				>
					{isLoading ? 'Проверяем...' : 'Войти'}
				</button>
			</form>
		</div>
	);
};

export default LoginForm;
