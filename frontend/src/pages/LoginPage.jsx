import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { login } from '@/services/authService';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/clients');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-2xl mb-4">
            <Scissors size={28} className="text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hair CRM</h1>
          <p className="text-gray-500 mt-1 text-sm">Увійдіть до системи</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-2 h-12 text-base">
              {loading ? 'Вхід...' : 'Увійти'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
