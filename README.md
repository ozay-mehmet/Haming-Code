# Hamming SEC-DED Simülatörü

Bu proje, kullanıcıların 8-bit veya 32-bitlik verileri Hamming kodlarıyla kodlayarak, hataları tanımlayıp düzeltebildiği basit bir web uygulamasıdır. SEC-DED (Single Error Correction, Double Error Detection) yapısını temel alır.

## Özellikler

- **8-bit ve 32-bit giriş desteği**
- **Hamming kodu üretimi**
- **Tek bitlik hata oluşturma**
- **Hata tespiti ve düzeltme**
- **Kullanıcı dostu arayüz**

## Ekran Görüntüsü

> `index.html` dosyasını çalıştırarak arayüzü tarayıcınızda görüntüleyebilirsiniz.

## Kullanım

1. `index.html` dosyasını bir tarayıcıda açın.
2. 8-bit veya 32-bitlik veri girişinizi yapın.
3. `Kodu Üret` butonuna basarak kodlanmış veriyi oluşturun.
4. Hata eklemek isterseniz, bir bit indexi girin ve `Hata Oluştur` butonuna tıklayın.
5. `Hata Düzelt` veya `Hata Tespit Et` seçenekleri ile hatayı analiz edin.

## Dosya Yapısı

- `index.html`: Ana HTML dosyası, kullanıcı arayüzünü içerir.
- `style.css`: Arayüzün stil dosyası.
- `script.js`: Tüm kodlama, hata ekleme ve düzeltme işlemlerini gerçekleştiren JavaScript dosyası.

## Kurulum

Yerel olarak çalıştırmak için:

```bash
git clone https://github.com/kullaniciAdi/Hamming-Code.git
cd Hamming-Code
start index.html
```

Veya doğrudan tarayıcınızda `index.html` dosyasını açarak kullanabilirsiniz.

## Katkıda Bulunma

Pull request'ler her zaman memnuniyetle karşılanır. Büyük değişiklikler yapmadan önce bir issue açarak neyi değiştirmek istediğinizi tartışmanız önerilir.

