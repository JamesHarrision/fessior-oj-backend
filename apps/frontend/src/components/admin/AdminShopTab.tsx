import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Eye, ShoppingCart, Award } from 'lucide-react';
import { api } from '../../services/api';

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
    <div className="problems-tab-grid">
      {/* Left side: Create shop item */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <form onSubmit={handleCreateItem} className="prob-admin-card">
          <h3>Thêm Vật Phẩm Shop Mới</h3>
          <div className="prob-form-group">
            <label>Tên vật phẩm</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="prob-admin-input"
              required
            />
          </div>

          <div className="prob-form-group">
            <label>Mô tả</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="prob-admin-input"
              required
            />
          </div>

          <div className="prob-form-grid-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="prob-form-group">
              <label>Giá (Coins / Điểm)</label>
              <input
                type="number"
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                className="prob-admin-input"
                min={0}
                required
              />
            </div>

            <div className="prob-form-group">
              <label>Loại vật phẩm</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="prob-admin-select"
              >
                <option value="AVATAR_FRAME">Khung Avatar (Avatar Frame)</option>
                <option value="THEME">Giao diện (Theme)</option>
              </select>
            </div>
          </div>

          <div className="prob-form-group">
            <label>Đường dẫn hình ảnh (Image URL)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/item.png"
              className="prob-admin-input"
            />
          </div>

          <button type="submit" className="btn-prob-primary">
            <Plus size={14} /> Thêm vào shop
          </button>
        </form>

        <div className="prob-admin-card">
          <h3>Kho Đồ Của Quản Trị Viên (Inventory)</h3>
          <div className="prob-list-scroll" style={{ maxHeight: '240px' }}>
            {inventory.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Kho đồ rỗng.</p>
            ) : (
              inventory.map((inv, idx) => {
                const invId = inv.id || inv._id;
                return (
                  <div key={invId || idx} className="prob-item-row">
                    <div className="prob-item-details">
                      <span className="prob-item-title" style={{ fontSize: '0.85rem' }}>
                        {inv.item?.name || 'Vật phẩm'} ({inv.item?.type})
                      </span>
                      <div className="prob-item-meta">
                        <span className="prob-tag-pill" style={{ fontSize: '0.68rem', color: inv.isEquipped ? '#10b981' : '#64748b' }}>
                          {inv.isEquipped ? 'Đang trang bị' : 'Chưa trang bị'}
                        </span>
                      </div>
                    </div>

                    <button onClick={() => handleEquip(invId)} className="prob-tag-pill" style={{ cursor: 'pointer', borderColor: '#60a5fa', color: '#60a5fa', fontSize: '0.7rem' }}>
                      Trang Bị
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right side: Shop Items list */}
      <div className="prob-admin-card">
        <h3><ShoppingBag size={18} style={{ color: '#ec4899', marginRight: '6px', verticalAlign: 'middle' }} /> Gian Hàng Trong Shop ({items.length})</h3>
        <div className="prob-list-scroll">
          {loading ? (
            <p>Đang tải gian hàng...</p>
          ) : items.length === 0 ? (
            <p style={{ color: '#64748b' }}>Không có vật phẩm nào được bày bán.</p>
          ) : (
            items.map((it, idx) => {
              const itId = it.id || it._id;
              return (
                <div key={itId || idx} className="prob-item-row" style={{ padding: '12px' }}>
                  <div className="prob-item-details">
                    <span className="prob-item-title" style={{ fontSize: '0.92rem' }}>
                      {it.name}
                    </span>
                    <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#8892b0' }}>
                      {it.description}
                    </p>
                    <div className="prob-item-meta">
                      <span className="diff-pill diff-easy" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>
                        {it.cost} COINS
                      </span>
                      <span className="prob-tag-pill" style={{ fontSize: '0.68rem' }}>
                        Loại: {it.type}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleBuy(itId)} className="btn-prob-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.78rem' }}>
                    <ShoppingCart size={12} /> Mua Test
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
