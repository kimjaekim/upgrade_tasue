import React, { useEffect, useMemo, useState } from "react";
import useStations from "../hooks/useStations";
import useFavorites from "../hooks/useFavorites";

function Stations() {
  const { data, loading, error, refresh } = useStations({ refreshMs: 60000 });
  const [q, setQ] = useState("");
  const [minAvail, setMinAvail] = useState(0);
  const [sortKey, setSortKey] = useState("name"); // name | available
  const fav = useFavorites();
  const [page, setPage] = useState(1);
  const pageSize = 50; // 페이지당 개수

  const getName = (s) => s?.station_name || s?.name || s?.stationName || s?.id || "대여소";
  const getId = (s) => s?.station_id || s?.id || s?.stationId || getName(s);
  const getCount = (s) => {
    const c = s?.parking_count ?? s?.available_bikes ?? s?.bike_count ?? s?.cnt;
    if (c != null) return Number(c);
    const total = Number(s?.rack_tot_cnt ?? s?.total_racks ?? s?.total ?? 0);
    const used = Number(s?.rack_use_cnt ?? s?.used ?? 0);
    if (!Number.isNaN(total) && !Number.isNaN(used) && total >= used) return total - used;
    return 0;
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let items = Array.isArray(data) ? data.slice() : [];
    if (term) {
      items = items.filter((s) => {
        const name = String(getName(s)).toLowerCase();
        const id = String(getId(s)).toLowerCase();
        const addr = String(s?.address || s?.addr || "").toLowerCase();
        return name.includes(term) || id.includes(term) || addr.includes(term);
      });
    }
    if (minAvail > 0) {
      items = items.filter((s) => getCount(s) >= minAvail);
    }
    items.sort((a, b) => {
      if (sortKey === "available") return getCount(b) - getCount(a);
      // default name
      return String(getName(a)).localeCompare(String(getName(b)), "ko");
    });
    return items;
  }, [data, q, minAvail, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // 필터가 바뀌면 1페이지로 이동, 페이지 범위 보정
  useEffect(() => {
    setPage(1);
  }, [q, minAvail, sortKey]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const pages = useMemo(() => {
    const arr = [];
    const max = totalPages;
    const window = 2; // 현재 기준 좌우 2개
    const start = Math.max(1, page - window);
    const end = Math.min(max, page + window);
    if (start > 1) arr.push(1);
    for (let p = start; p <= end; p++) arr.push(p);
    if (end < max) arr.push(max);
    return Array.from(new Set(arr));
  }, [page, totalPages]);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>대여소 목록</h2>

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 140px 160px 100px', alignItems: 'center' }}>
        <input
          placeholder="이름/번호/주소 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <option value="name">이름순</option>
          <option value="available">잔여 많은순</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label className="muted" htmlFor="minAvail">잔여 ≥</label>
          <input id="minAvail" type="number" min={0} value={minAvail} onChange={(e) => setMinAvail(Number(e.target.value) || 0)} style={{ width: 64, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          <span className="muted">대</span>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => refresh()}>새로고침</button>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 14 }} className="muted">
        {loading ? "불러오는 중…" : error ? `오류: ${error}` : `${filtered.length}개 대여소 표시`}
      </div>

      <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1.15fr 0.6fr 1fr', padding: '10px 12px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
          <div></div>
          <div>대여소</div>
          <div style={{ textAlign: 'right' }}>잔여</div>
          <div style={{ textAlign: 'right' }}>거치대/기타</div>
        </div>
        <div>
          {pageItems.map((s, idx) => {
            const name = getName(s);
            const id = getId(s);
            const avail = getCount(s);
            const total = Number(s?.rack_tot_cnt ?? s?.total_racks ?? s?.total ?? 0) || undefined;
            const addr = s?.address || s?.addr || "";
            let color = "#ef4444"; if (avail >= 5) color = "#22c55e"; else if (avail >= 3) color = "#f59e0b";
            return (
              <div key={`${id}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '28px 1.15fr 0.6fr 1fr', padding: '10px 12px', borderTop: (idx === 0 && page === 1) ? 'none' : '1px solid #f3f4f6', alignItems: 'center' }}>
                <div>
                  <button onClick={() => fav.toggle(id)} aria-label={fav.has(id) ? '즐겨찾기 해제' : '즐겨찾기 추가'} title={fav.has(id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: fav.has(id) ? '#ef4444' : '#9ca3af' }}>
                    {fav.has(id) ? '❤' : '♡'}
                  </button>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{id}{addr ? ` · ${addr}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, color }}>
                  {avail}대
                </div>
                <div style={{ textAlign: 'right' }}>
                  {total ? `거치대 ${total}` : <span className="muted">-</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 페이지네이션 */}
      <div className="pagination">
        <a
          href="#"
          className="page-btn"
          role="button"
          aria-label="이전 페이지"
          aria-disabled={page <= 1}
          onClick={(e) => {
            e.preventDefault();
            if (page > 1) {
              setPage(page - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          이전
        </a>
        {pages.map((p) => (
          <a
            key={p}
            href="#"
            className={`page-btn${p === page ? ' current' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`${p}페이지`}
            onClick={(e) => { e.preventDefault(); setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            {p}
          </a>
        ))}
        <a
          href="#"
          className="page-btn"
          role="button"
          aria-label="다음 페이지"
          aria-disabled={page >= totalPages}
          onClick={(e) => {
            e.preventDefault();
            if (page < totalPages) {
              setPage(page + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          다음
        </a>
      </div>
    </div>
  );
}

export default Stations;
