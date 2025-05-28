# 🌟 A* Pathfinding Visualization

Bu proje, A* (A-Star) algoritmasının grid tabanlı görsel simülasyonunu sunar. Başlangıç (yeşil) ve hedef (kırmızı) noktalar arasındaki en kısa yol, adım adım görselleştirilir. Obstacle (engel) hücreler rastgele yerleştirilir ve algoritma bu engelleri aşarak yolu bulur.

![A* Demo](./public/astar.png)

## 🚀 Özellikler

- A* algoritmasının adım adım animasyonlu görselleştirmesi
- Engel yoğunluğu, grid boyutu ve animasyon hızı ayarlanabilir
- Canlı olarak açık (open set), kapalı (closed set), geçerli yol ve incelenen düğüm renklerle gösterilir

---

## ⚙️ Gereksinimler

- [Node.js](https://nodejs.org) (npm ile birlikte gelir)
- Modern bir tarayıcı (Chrome, Firefox, Edge, vb.)

---

## 📦 Kurulum

Aşağıdaki adımları takip ederek projeyi sıfırdan çalıştırabilirsin:

### 1. Proje klasörünü oluştur

```bash
mkdir a_star_visualizer
cd a_star_visualizer
