import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Sparkles, Check } from 'lucide-react';

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
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 lg:p-8">
      {/* Header */}
      <div className="bg-washi border border-charcoal p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-ink p-3 border border-charcoal">
            <ShoppingBag size={32} className="text-vermilion" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-linen uppercase tracking-wider">Cửa Hàng Đấu Sĩ</h2>
            <p className="font-body text-sm text-stone mt-1">Sử dụng điểm thưởng Arena để mua và trang bị vật phẩm mới</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-charcoal">
        <button
          className={`px-6 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'shop'
              ? 'text-vermilion border-vermilion'
              : 'text-stone border-transparent hover:text-linen hover:border-charcoal'
          }`}
          onClick={() => { setActiveTab('shop'); setMessage(''); }}
        >
          Cửa Hàng
        </button>
        <button
          className={`px-6 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'inventory'
              ? 'text-vermilion border-vermilion'
              : 'text-stone border-transparent hover:text-linen hover:border-charcoal'
          }`}
          onClick={() => { setActiveTab('inventory'); setMessage(''); }}
        >
          Kho Đồ
        </button>
      </div>

      {message && (
        <div className="bg-vermilion/10 border-l-4 border-vermilion p-4 text-linen font-body text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-charcoal border-t-vermilion" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'shop' ? (
            shopItems.length === 0 ? (
              <div className="col-span-full bg-ink border border-charcoal border-dashed p-12 text-center">
                <p className="font-body text-stone text-sm">Không có vật phẩm nào trong cửa hàng lúc này.</p>
              </div>
            ) : (
              shopItems.map((item) => (
                <div key={item.id} className="bg-washi border border-charcoal p-5 flex flex-col gap-4 hover:border-stone transition-colors group">
                  <div className="bg-ink aspect-square w-full border border-charcoal flex items-center justify-center">
                    <Sparkles size={48} className="text-stone group-hover:text-vermilion transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-bold text-linen uppercase tracking-wide group-hover:text-vermilion transition-colors">{item.name}</h3>
                    <p className="font-body text-xs text-stone mt-2 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-charcoal flex justify-between items-center">
                    <span className="font-display text-xs font-bold text-vermilion uppercase tracking-widest">{item.price} ĐIỂM</span>
                    <button
                      onClick={() => handleBuy(item.id)}
                      className="bg-vermilion text-linen px-4 py-2 font-display text-xs font-bold uppercase tracking-wider hover:bg-vermilion-hover transition-colors"
                    >
                      Mua
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            inventory.length === 0 ? (
              <div className="col-span-full bg-ink border border-charcoal border-dashed p-12 text-center">
                <p className="font-body text-stone text-sm">Kho đồ trống. Hãy ghé cửa hàng để mua vật phẩm nhé!</p>
              </div>
            ) : (
              inventory.map((invItem) => (
                <div key={invItem.id} className={`bg-washi border p-5 flex flex-col gap-4 transition-colors group ${invItem.is_equipped ? 'border-vermilion' : 'border-charcoal hover:border-stone'}`}>
                  <div className="bg-ink aspect-square w-full border border-charcoal flex items-center justify-center relative">
                    {invItem.is_equipped ? (
                      <>
                        <Check size={48} className="text-vermilion" />
                        <div className="absolute top-2 right-2 bg-vermilion text-linen text-[10px] font-display font-bold px-2 py-0.5 uppercase tracking-wider">
                          Trang bị
                        </div>
                      </>
                    ) : (
                      <Sparkles size={48} className="text-stone group-hover:text-linen transition-colors" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-bold text-linen uppercase tracking-wide group-hover:text-vermilion transition-colors">{invItem.item.name}</h3>
                    <p className="font-body text-xs text-stone mt-2 line-clamp-2">{invItem.item.description}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-charcoal flex justify-end items-center">
                    {!invItem.is_equipped ? (
                      <button
                        onClick={() => handleEquip(invItem.id)}
                        className="border border-charcoal text-linen px-4 py-2 font-display text-xs font-bold uppercase tracking-wider hover:border-vermilion hover:text-vermilion transition-colors w-full"
                      >
                        Trang bị
                      </button>
                    ) : (
                      <span className="font-display text-[10px] font-bold text-vermilion uppercase tracking-widest text-center w-full py-2">
                        Đang sử dụng
                      </span>
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
