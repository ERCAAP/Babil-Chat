import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [duaCategory, setDuaCategory] = useState('');
  const [duaText, setDuaText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const duaCategories = [
    { id: 'health', name: '🏥 Sağlık', desc: 'Hastalık, şifa, iyileşme' },
    { id: 'work', name: '💼 İş/Kariyer', desc: 'İş bulma, başarı, terfi' },
    { id: 'family', name: '👨‍👩‍👧‍👦 Aile', desc: 'Evlilik, çocuk, barış' },
    { id: 'education', name: '📚 Eğitim', desc: 'Sınav, öğrenim, bilgi' },
    { id: 'financial', name: '💰 Mali', desc: 'Rızık, bereket, borç' },
    { id: 'general', name: '🤲 Genel', desc: 'Hidayet, mağfiret, rahmet' }
  ];

  const handleSubmitDua = () => {
    if (!duaCategory || !duaText.trim()) {
      alert('Lütfen kategori seçin ve dua talebinizi yazın');
      return;
    }
    
    // Here would be the API call to submit dua
    console.log('Dua submitted:', {
      category: duaCategory,
      text: duaText,
      anonymous: isAnonymous
    });
    
    // Reset form
    setDuaText('');
    setDuaCategory('');
    setShowDuaModal(false);
    
    alert('🤲 Dua talebiniz toplulukla paylaşıldı. İnşallah hayırlısı olur.');
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ color: '#ffffff', fontSize: 32, margin: '0 0 10px 0', fontWeight: 'bold' }}>
            🌙 Hidayet
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, margin: 0 }}>
            İslami Hayat Rehberiniz
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}>
          <h3 style={{ color: '#8b5cf6', fontSize: 16, margin: '0 0 15px 0' }}>
            📖 Günün Ayeti
          </h3>
          <p style={{
            color: '#ffffff',
            fontSize: 18,
            textAlign: 'right',
            marginBottom: 10,
            fontFamily: 'serif'
          }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p style={{ color: '#e2e8f0', fontSize: 14, marginBottom: 5 }}>
            Rahman ve Rahim olan Allah'ın adıyla
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
            Fatiha Suresi - 1. Ayet
          </p>
        </div>

        {/* Next Prayer */}
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}>
          <h3 style={{ color: '#22c55e', fontSize: 16, margin: '0 0 10px 0' }}>
            ⏰ Sıradaki Namaz
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', margin: 0 }}>
                Öğle - الظهر
              </p>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                2 saat 35 dakika sonra
              </p>
            </div>
            <div style={{ color: '#22c55e', fontSize: 24 }}>🕐</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            padding: 12,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🧭</div>
            <div style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Kıble</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>147°</div>
          </div>
          
          <div 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setShowDuaModal(true)}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🤲</div>
            <div style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>Dua İste</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>Topluluktan</div>
          </div>
        </div>

        {/* Dua Requests Preview */}
        <div style={{
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}>
          <h3 style={{ color: '#ec4899', fontSize: 16, margin: '0 0 10px 0' }}>
            🤲 Son Dua Talepleri
          </h3>
          <div style={{ marginBottom: 10 }}>
            <p style={{ color: '#ffffff', fontSize: 14, margin: '0 0 5px 0' }}>
              "Hasta annem için şifa duası" - Ahmet K.
            </p>
            <p style={{ color: '#22c55e', fontSize: 12, margin: 0 }}>
              ❤️ 156 kişi dua etti
            </p>
          </div>
          <div>
            <p style={{ color: '#ffffff', fontSize: 14, margin: '0 0 5px 0' }}>
              "İş bulabilmem için dua edin" - Anonim
            </p>
            <p style={{ color: '#22c55e', fontSize: 12, margin: 0 }}>
              ❤️ 89 kişi dua etti
            </p>
          </div>
        </div>

        {/* Reading Progress */}
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 12,
          padding: 16
        }}>
          <h3 style={{ color: '#f59e0b', fontSize: 16, margin: '0 0 10px 0' }}>
            📚 Kuran Okuma
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#ffffff' }}>Günlük: 5/5 Ayet</span>
            <span style={{ color: '#22c55e' }}>✅</span>
          </div>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            height: 8,
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#f59e0b',
              height: '100%',
              width: '100%',
              borderRadius: 4
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>7 gün streak</span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>2 hatm</span>
          </div>
        </div>

        {/* Dua Request Modal */}
        {showDuaModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}>
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ color: '#ffffff', fontSize: 20, margin: 0 }}>
                  🤲 Dua Talebi
                </h2>
                <button
                  onClick={() => setShowDuaModal(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: 24,
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Category Selection */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: '#ec4899', fontSize: 16, marginBottom: 12 }}>
                  📂 Kategori Seçin
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {duaCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setDuaCategory(category.id)}
                      style={{
                        backgroundColor: duaCategory === category.id 
                          ? 'rgba(236, 72, 153, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: duaCategory === category.id 
                          ? '2px solid #ec4899' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        padding: 10,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                        {category.name}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>
                        {category.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dua Text */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: '#ec4899', fontSize: 16, marginBottom: 8 }}>
                  ✍️ Dua Talebiniz
                </h3>
                <textarea
                  value={duaText}
                  onChange={(e) => setDuaText(e.target.value)}
                  placeholder="Dua talebinizi yazın... (Özel bilgiler paylaşmayın)"
                  style={{
                    width: '100%',
                    height: 100,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: 12,
                    color: '#ffffff',
                    fontSize: 14,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  maxLength={300}
                />
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                  {duaText.length}/300 karakter
                </div>
              </div>

              {/* Privacy Settings */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: '#ec4899', fontSize: 16, marginBottom: 12 }}>
                  🔒 Gizlilik
                </h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="privacy"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(true)}
                      style={{ marginRight: 8 }}
                    />
                    <span style={{ color: '#ffffff', fontSize: 14 }}>🎭 Anonim</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="privacy"
                      checked={!isAnonymous}
                      onChange={() => setIsAnonymous(false)}
                      style={{ marginRight: 8 }}
                    />
                    <span style={{ color: '#ffffff', fontSize: 14 }}>👤 İsimli</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowDuaModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    color: '#94a3b8',
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={handleSubmitDua}
                  disabled={!duaCategory || !duaText.trim()}
                  style={{
                    flex: 2,
                    backgroundColor: duaCategory && duaText.trim() ? '#ec4899' : 'rgba(236, 72, 153, 0.3)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 16px',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: '600',
                    cursor: duaCategory && duaText.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  🤲 Dua İste
                </button>
              </div>

              {/* Info */}
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 8,
                padding: 12,
                marginTop: 16
              }}>
                <p style={{ color: '#3b82f6', fontSize: 12, margin: 0 }}>
                  ℹ️ Dua talebiniz moderasyondan geçtikten sonra toplulukla paylaşılacaktır. 
                  Özel bilgiler (isim, adres, telefon) paylaşmayın.
                </p>
              </div>
            </div>
          </div>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
} 