import { useState, useEffect, useCallback } from 'react';
import { Plus, Scissors, Search, Edit, Trash2 } from 'lucide-react';
import { fetchServices, deleteService } from '@/services/serviceService';
import Card from '@/components/elements/Card';
import Button from '@/components/elements/Button';
import Badge from '@/components/elements/Badge';
import ServiceFormModal from '@/components/services/ServiceFormModal';

const ServicesPage = () => {
  const [services, setServices]     = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editService, setEditService] = useState(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const result = await fetchServices(search);
    setServices(result.data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadServices, 300);
    return () => clearTimeout(timer);
  }, [loadServices]);

  const handleDelete = async (service) => {
    if (!window.confirm(`Видалити послугу "${service.name}"?`)) return;
    const result = await deleteService(service.id);
    if (result.success) loadServices();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditService(null);
    loadServices();
  };

  const handleEdit = (service, e) => {
    e.stopPropagation();
    setEditService(service);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-14 z-20">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук послуги..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">{services.length} послуг</span>
          <Button size="sm" onClick={() => { setEditService(null); setShowForm(true); }}>
            <Plus size={15} /> Додати
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Scissors size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Послуг не знайдено</p>
          </div>
        ) : (
          services.map((service) => (
            <Card key={service.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{service.name}</span>
                    {!service.isActive && (
                      <Badge className="bg-gray-100 text-gray-500">Неактивна</Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-bold text-pink-500 text-base">{service.basePrice} грн</span>
                    {service.durationMinutes && (
                      <span className="text-xs text-gray-400">{service.durationMinutes} хв</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleEdit(service, e)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(service); }}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ServiceFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditService(null); }}
        onSaved={handleSaved}
        service={editService}
      />
    </div>
  );
};

export default ServicesPage;
