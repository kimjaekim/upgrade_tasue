import React, { useEffect, useMemo, useState } from "react";

function Notice() {
  const API_BASE = useMemo(() => process.env.REACT_APP_API_BASE || "http://localhost:3001", []);
  const [tab, setTab] = useState("notice"); // notice | faq
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notices, setNotices] = useState([]);
  const [faqs, setFaqs] = useState([]); // 기존 제목 리스트 (백업용)
  const [faqQa, setFaqQa] = useState([]); // 질문/답변용
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const fetchData = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const url = type === "faq" ? `${API_BASE}/faqs?full=1` : `${API_BASE}/notices`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      if (type === "faq") {
        // full=1이면 question/answer 구조, 아니면 title/url 구조
        if (items.length && items[0]?.question) setFaqQa(items);
        else setFaqs(items);
      }
      else setNotices(items);
    } catch (e) {
      setError(e.message || "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 답변을 문단 단위로 분할하여 <p>로 렌더링
  const renderAnswerParagraphs = (text) => {
    if (!text) return ["내용을 불러올 수 없습니다."];
    // 정규화
    let t = String(text).replace(/\r\n?/g, "\n").trim();
    // 번호 리스트 줄바꿈 보장: "\n\d+\.\s"
    t = t.replace(/\n?\s*(\d+)\.(\s)/g, "\n$1.$2");
    // 불릿(◆) 앞에 줄바꿈 삽입
    t = t.replace(/\s*◆\s*/g, "\n◆ ");
    // 동그라미 숫자(①-⑳) 앞에 줄바꿈 삽입
    t = t.replace(/\s*([\u2460-\u2473])/g, "\n$1 ");
    // 이중개행을 문단 경계로 사용. 없다면 단일 개행 기준으로 분할
    const blocks = (t.includes("\n\n") ? t.split(/\n{2,}/) : t.split(/\n+/))
      .map(s => s.trim())
      .filter(Boolean);
    return blocks;
  };

  useEffect(() => {
    fetchData("notice");
    fetchData("faq");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentItems = tab === "faq" ? (faqQa.length ? faqQa : faqs) : notices;

  const handleNoticeCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("공지 링크가 클립보드에 복사되었습니다.");
    } catch (e) {
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, color: "#16a34a" }}>고객센터</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setTab("notice")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: tab === "notice" ? "1px solid #16a34a" : "1px solid #e5e7eb",
            background: tab === "notice" ? "#f0fdf4" : "#fff",
            color: "#111827",
            cursor: "pointer"
          }}
        >
          공지사항
        </button>
        <button
          onClick={() => setTab("faq")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: tab === "faq" ? "1px solid #16a34a" : "1px solid #e5e7eb",
            background: tab === "faq" ? "#f0fdf4" : "#fff",
            color: "#111827",
            cursor: "pointer"
          }}
        >
          자주 묻는 질문
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => fetchData(tab === "faq" ? "faq" : "notice")}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
        >
          새로고침
        </button>
      </div>

      {loading && (
        <div className="skeleton" aria-hidden>
          <div className="skeleton-line w80" />
          <div className="skeleton-line w60" />
          <div className="skeleton-line w80" />
          <div className="skeleton-line w40" />
        </div>
      )}
      {error && (
        <div style={{ color: "#dc2626", marginBottom: 12 }}>오류: {error}</div>
      )}

      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12
      }}>
        {currentItems.length === 0 && !loading ? (
          <div className="muted">표시할 항목이 없습니다.</div>
        ) : (
          tab === "faq" ? (
            // FAQ 아코디언
            <ul className="faq-list">
              {(faqQa.length ? faqQa : faqs).map((it, idx) => (
                <li key={`faq-${idx}`} className="faq-item" style={{ paddingBottom: openFaqIndex === idx ? 8 : 0, borderBottom: idx === currentItems.length - 1 ? 'none' : undefined }}>
                  <button
                    id={`faq-btn-${idx}`}
                    aria-expanded={openFaqIndex === idx}
                    aria-controls={`faq-panel-${idx}`}
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className={`faq-qbtn${openFaqIndex === idx ? ' is-open' : ''}`}
                  >
                    {it.question || it.title}
                    <span aria-hidden="true" style={{ float: 'right', transition: 'transform 200ms', transform: openFaqIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </button>
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="faq-panel"
                    style={{ maxHeight: openFaqIndex === idx ? 1000 : 0, opacity: openFaqIndex === idx ? 1 : 0 }}
                  >
                    <div className="faq-answer">
                      {renderAnswerParagraphs(it.answer).map((p, i) => {
                        const isBullet = p.startsWith('◆');
                        return (
                          <p key={i} style={{ margin: '0 0 10px 0' }}>
                            {isBullet ? <strong>{p}</strong> : p}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // 공지: 외부 브라우저 방지, 복사 버튼 제공
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {currentItems.map((it, idx) => (
                <li key={`notice-${idx}`} style={{
                  padding: "10px 6px",
                  borderBottom: idx === currentItems.length - 1 ? "none" : "1px solid #f3f4f6",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ color: "#111827" }}>{it.title}</span>
                  <button
                    onClick={() => handleNoticeCopy(it.url)}
                    style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
                  >
                    링크 복사
                  </button>
                  {it.date && <span className="muted" style={{ fontSize: 12 }}>{it.date}</span>}
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        데이터 출처: 타슈 공식 고객센터 (실시간 파싱)
      </p>
    </div>
  );
}

export default Notice;
