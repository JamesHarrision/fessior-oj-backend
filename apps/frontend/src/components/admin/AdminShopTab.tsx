import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, ShoppingCart } from 'lucide-react';
import { api } from '../../services/api';
import { AdminCard, AdminHeader, AdminButton, AdminInput, AdminFormGroup, AdminSelect, AdminListRow, AdminBadge } from './ui/AdminUI';

export const AdminShopTab: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New Shop Item form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(100);
  const [type, setType] = useState<'AVATAR_FRAME' | 'THEME'>('AVATAR_FRAME');
  const [imageUrl, setImageUrl] = useState('');

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const itemsRes = await api.getShopItems();
      if (itemsRes.success) {
        setItems(itemsRes.data || []);
      }
      const inventoryRes = await api.getInventory();
      if (inventoryRes.success) {
        setInventory(inventoryRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createShopItem({
        name,
        description,
        cost: Number(cost),
        type,
        imageUrl: imageUrl || undefined
      });
      if (res.success) {
        alert('Tạo vật phẩm mới thành công!');
        setName('');
        setDescription('');
        setCost(100);
        setImageUrl('');
        fetchShopData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm vật phẩm');
    }
  };

  const handleBuy = async (itemId: string) => {
    try {
      const res = await api.buyItem(itemId);
      if (res.success) {
        alert('Mua vật phẩm thành công!');
        fetchShopData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi mua vật phẩm (Có thể không đủ điểm)');
    }
  };

  const handleEquip = async (invId: string) => {
    try {
      const res = await api.equipItem(invId);
      if (res.success) {
        alert('Đã trang bị / tháo trang bị vật phẩm.');
        fetchShopData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi trang bị vật phẩm');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left side: Create shop item */}
      <div className="flex flex-col gap-6">
        <AdminCard>
          <AdminHeader>Thêm Vật Phẩm Shop Mới</AdminHeader>
          <form onSubmit={handleCreateItem} className="flex flex-col gap-4 mt-2">
            <AdminFormGroup label="Tên vật phẩm">
              <AdminInput
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </AdminFormGroup>

            <AdminFormGroup label="Mô tả">
              <AdminInput
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </AdminFormGroup>

            <div className="grid grid-cols-2 gap-4">
              <AdminFormGroup label="Giá (Coins / Điểm)">
                <AdminInput
                  type="number"
                  value={cost}
                  onChange={e => setCost(Number(e.target.value))}
                  min={0}
                  required
                />
              </AdminFormGroup>

              <AdminFormGroup label="Loại vật phẩm">
                <AdminSelect
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                >
                  <option value="AVATAR_FRAME">Khung Avatar (Avatar Frame)</option>
                  <option value="THEME">Giao diện (Theme)</option>
                </AdminSelect>
              </AdminFormGroup>
            </div>

            <AdminFormGroup label="Đường dẫn hình ảnh (Image URL)">
              <AdminInput
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/item.png"
              />
            </AdminFormGroup>

            <AdminButton type="submit" className="mt-2">
              <Plus size={14} /> Thêm vào shop
            </AdminButton>
          </form>
        </AdminCard>

        <AdminCard>
          <AdminHeader>Kho Đồ Của Quản Trị Viên (Inventory)</AdminHeader>
          <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-1">
            {inventory.length === 0 ? (
              <p className="text-stone text-sm">Kho đồ rỗng.</p>
            ) : (
              inventory.map((inv, idx) => {
                const invId = inv.id || inv._id;
                return (
                  <AdminListRow key={invId || idx}>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-sm text-linen font-body">
                        {inv.item?.name || 'Vật phẩm'} ({inv.item?.type})
                      </span>
                      <div className="flex items-center gap-2">
                        <AdminBadge color={inv.isEquipped ? 'green' : 'gray'}>
                          {inv.isEquipped ? 'Đang trang bị' : 'Chưa trang bị'}
                        </AdminBadge>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleEquip(invId)} 
                      className="text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      Trang Bị
                    </button>
                  </AdminListRow>
                );
              })
            )}
          </div>
        </AdminCard>
      </div>

      {/* Right side: Shop Items list */}
      <AdminCard>
        <AdminHeader>
          <ShoppingBag size={18} className="text-pink-500" /> Gian Hàng Trong Shop ({items.length})
        </AdminHeader>
        <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-1">
          {loading ? (
            <p className="text-stone text-sm">Đang tải gian hàng...</p>
          ) : items.length === 0 ? (
            <p className="text-stone text-sm">Không có vật phẩm nào được bày bán.</p>
          ) : (
            items.map((it, idx) => {
              const itId = it.id || it._id;
              return (
                <AdminListRow key={itId || idx} className="items-start">
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-semibold text-sm text-linen font-body">
                      {it.name}
                    </span>
                    <p className="text-sm text-surface-300 m-0">
                      {it.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <AdminBadge color="pink" className="bg-pink-500/10 border-pink-500/20 text-pink-400">
                        {it.cost} COINS
                      </AdminBadge>
                      <AdminBadge>
                        Loại: {it.type}
                      </AdminBadge>
                    </div>
                  </div>

                  <AdminButton variant="primary" onClick={() => handleBuy(itId)} className="px-3 self-center whitespace-nowrap">
                    <ShoppingCart size={14} /> Mua Test
                  </AdminButton>
                </AdminListRow>
              );
            })
          )}
        </div>
      </AdminCard>
    </div>
  );
};

