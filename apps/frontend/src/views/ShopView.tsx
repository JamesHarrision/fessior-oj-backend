import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Sparkles, Check } from 'lucide-react';
import './ShopView.css';

export const ShopView: React.FC = () => {
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const shopRes = await api.getShopItems();
      const invRes = await api.getInventory();
      if (shopRes.success) setShopItems(shopRes.data);
      if (invRes.success) setInventory(invRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuy = async (itemId: string) => {
    setMessage('');
    try {
      const res = await api.buyItem(itemId);
      if (res.success) {
        setMessage('Mua vật phẩm thành công!');
        loadData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Không đủ điểm hoặc lỗi hệ thống.');
    }
  };

  const handleEquip = async (inventoryItemId: string) => {
    setMessage('');
    try {
      const res = await api.equipItem(inventoryItemId);
      if (res.success) {
        setMessage('Đã trang bị vật phẩm!');
        loadData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Không thể trang bị.');
    }
  };

  return (
    <div className="shop-view glass-card">
      <div className="shop-header">
        <ShoppingBag size={28} className="glow-icon-purple" />
        <h2>Cửa Hàng Đấu Sĩ</h2>
        <p>Mua các tùy chỉnh hồ sơ đẹp mắt bằng điểm thưởng Arena</p>
      </div>

      <div className="shop-tabs">
        <button
          className={`shop-tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => { setActiveTab('shop'); setMessage(''); }}
        >
          Cửa Hàng
        </button>
        <button
          className={`shop-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => { setActiveTab('inventory'); setMessage(''); }}
        >
          Kho Đồ
        </button>
      </div>

      {message && <p className="shop-msg">{message}</p>}

      {loading ? (
        <div className="shop-loading">Đang tải cửa hàng...</div>
      ) : (
        <div className="items-grid">
          {activeTab === 'shop' ? (
            shopItems.length === 0 ? (
              <p className="no-items">Không có vật phẩm nào trong cửa hàng lúc này.</p>
            ) : (
              shopItems.map((item) => (
                <div key={item.id} className="shop-item-card">
                  <div className="item-icon-wrapper">
                    <Sparkles size={24} className="sparkle-icon" />
                  </div>
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-desc">{item.description}</p>
                  <div className="item-footer">
                    <span className="item-price">{item.price} ĐIỂM</span>
                    <button onClick={() => handleBuy(item.id)} className="buy-btn">
                      Mua
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            inventory.length === 0 ? (
              <p className="no-items">Kho đồ trống. Hãy ghé cửa hàng để mua vật phẩm nhé!</p>
            ) : (
              inventory.map((invItem) => (
                <div key={invItem.id} className={`shop-item-card ${invItem.isEquipped ? 'equipped' : ''}`}>
                  <div className="item-icon-wrapper">
                    {invItem.isEquipped ? <Check size={24} className="check-icon" /> : <Sparkles size={24} className="sparkle-icon" />}
                  </div>
                  <h3 className="item-name">{invItem.item.name}</h3>
                  <p className="item-desc">{invItem.item.description}</p>
                  <div className="item-footer">
                    <span className="equipped-label">{invItem.isEquipped ? 'Đang trang bị' : 'Chưa dùng'}</span>
                    {!invItem.isEquipped && (
                      <button onClick={() => handleEquip(invItem.id)} className="equip-btn">
                        Trang bị
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
};
