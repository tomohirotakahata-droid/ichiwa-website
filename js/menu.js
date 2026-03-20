/**
 * いちわ メニュー自動読み込みスクリプト
 * menu.json を読み込んでメニューを自動表示します。
 * 価格改定時は data/menu.json を編集するだけでOKです。
 */

async function loadMenu() {
  const container = document.getElementById('menu-container');
  const lastUpdatedEl = document.getElementById('last-updated');

  if (!container) return;

  container.innerHTML = '<div class="loading">メニューを読み込み中...</div>';

  try {
    // GitHub Pages の場合はパスを自動調整
    const basePath = getBasePath();
    const response = await fetch(basePath + 'data/menu.json');

    if (!response.ok) {
      throw new Error('メニューデータの取得に失敗しました');
    }

    const data = await response.json();

    // 最終更新日を表示
    if (lastUpdatedEl && data.lastUpdated) {
      lastUpdatedEl.textContent = '最終更新: ' + formatDate(data.lastUpdated);
    }

    // メニューを構築
    container.innerHTML = '';
    data.categories.forEach(category => {
      container.appendChild(buildCategorySection(category));
    });

  } catch (err) {
    container.innerHTML = `<div class="error">
      メニューの読み込みに失敗しました。<br>
      <small>${err.message}</small>
    </div>`;
    console.error('Menu load error:', err);
  }
}

function getBasePath() {
  // 全ページがルートに置かれているため常に './'
  return './';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

function formatPrice(price) {
  return price.toLocaleString('ja-JP');
}

function buildCategorySection(category) {
  const section = document.createElement('div');
  section.className = 'menu-section';
  section.id = 'cat-' + category.id;

  // ヘッダー
  const header = document.createElement('div');
  header.className = 'menu-section-header';
  header.innerHTML = `
    <h2>${escapeHtml(category.name)}</h2>
    ${category.note ? `<span class="menu-section-note">${escapeHtml(category.note)}</span>` : ''}
  `;
  section.appendChild(header);

  const body = document.createElement('div');
  body.className = 'menu-section-body';

  // サブカテゴリがある場合（ホルモンなど）
  if (category.subcategories) {
    category.subcategories.forEach(sub => {
      const subDiv = document.createElement('div');
      subDiv.className = 'menu-subcategory';
      subDiv.innerHTML = `<h3>${escapeHtml(sub.name)}</h3>`;

      sub.items.forEach(item => {
        subDiv.appendChild(buildMenuItem(item));
      });

      body.appendChild(subDiv);
    });
  } else if (category.items) {
    category.items.forEach(item => {
      // バリアント（サイズ違い）がある場合
      if (item.variants) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'menu-item-header';
        headerDiv.innerHTML = `
          <span class="menu-item-name">${escapeHtml(item.name)}</span>
          ${item.description ? `<span class="menu-item-desc">${escapeHtml(item.description)}</span>` : ''}
        `;
        body.appendChild(headerDiv);

        const variantsDiv = document.createElement('div');
        variantsDiv.className = 'menu-variants';
        item.variants.forEach(v => {
          const row = document.createElement('div');
          row.className = 'menu-variant-row';
          row.innerHTML = `
            <span class="menu-variant-label">${escapeHtml(v.label)}</span>
            <span class="menu-variant-price">${formatPrice(v.price)}<span class="yen">円</span></span>
          `;
          variantsDiv.appendChild(row);
        });
        body.appendChild(variantsDiv);
      } else {
        body.appendChild(buildMenuItem(item));
      }
    });
  }

  section.appendChild(body);
  return section;
}

function buildMenuItem(item) {
  const div = document.createElement('div');
  div.className = 'menu-item';

  const left = document.createElement('div');
  left.className = 'menu-item-left';

  const nameEl = document.createElement('div');
  nameEl.className = 'menu-item-name';
  nameEl.textContent = item.name;

  if (item.recommended) {
    const badge = document.createElement('span');
    badge.className = 'badge-recommended';
    badge.textContent = 'おすすめ';
    nameEl.appendChild(badge);
  }

  left.appendChild(nameEl);

  if (item.description) {
    const desc = document.createElement('div');
    desc.className = 'menu-item-desc';
    desc.textContent = item.description;
    left.appendChild(desc);
  }

  div.appendChild(left);

  // 価格表示
  if (item.price !== undefined) {
    const priceEl = document.createElement('div');
    priceEl.className = 'menu-item-price';

    let priceHtml = `${formatPrice(item.price)}<span class="yen">円</span>`;

    if (item.megaPrice) {
      priceHtml += `<span class="mega-price">メガ ${formatPrice(item.megaPrice)}円</span>`;
    }

    priceEl.innerHTML = priceHtml;
    div.appendChild(priceEl);
  }

  return div;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', loadMenu);
