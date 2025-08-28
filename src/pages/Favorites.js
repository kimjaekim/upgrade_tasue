import React, { useMemo } from "react";
import useFavorites from "../hooks/useFavorites";
import useStations from "../hooks/useStations";

function Favorites() {
  const fav = useFavorites();
  const { data, loading, error, refresh } = useStations({ refreshMs: 60000 });

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

  const items = useMemo(() => {
    const set = new Set(fav.ids);
    return (Array.isArray(data) ? data : []).filter((s) => set.has(getId(s)));
  }, [data, fav.ids]);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>즐겨찾기</h2>
      <div className="muted" style={{ marginTop: 4 }}>
        {loading ? "불러오는 중…" : error ? `오류: ${error}` : `${items.length}개 대여소`}
      </div>

      <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1.15fr 0.6fr 1fr', padding: '10px 12px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
          <div></div>
          <div>대여소</div>
          <div style={{ textAlign: 'right' }}>잔여</div>
          <div style={{ textAlign: 'right' }}>거치대/기타</div>
        </div>
        <div>
          {items.map((s, idx) => {
            const name = getName(s);
            const id = getId(s);
            const avail = getCount(s);
            const total = Number(s?.rack_tot_cnt ?? s?.total_racks ?? s?.total ?? 0) || undefined;
            let color = "#ef4444"; if (avail >= 5) color = "#22c55e"; else if (avail >= 3) color = "#f59e0b";
            return (
              <div key={`${id}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '28px 1.15fr 0.6fr 1fr', padding: '10px 12px', borderTop: idx === 0 ? 'none' : '1px solid #f3f4f6', alignItems: 'center' }}>
                <div>
                  <button onClick={() => fav.toggle(id)} aria-label={'즐겨찾기 해제'} title={'즐겨찾기 해제'}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#ef4444' }}>
                    ❤
                  </button>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{id}</div>
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
          {!loading && !error && items.length === 0 && (
            <div style={{ padding: '18px 12px' }} className="muted">즐겨찾기한 대여소가 없습니다. 대여소 목록에서 ♡ 버튼을 눌러 추가하세요.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favorites;
