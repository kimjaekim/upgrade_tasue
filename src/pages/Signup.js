import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";

const schema = yup.object({
  email: yup
    .string()
    .required("올바른 이메일을 입력하세요")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "올바른 이메일을 입력하세요"),
  password: yup
    .string()
    .required("비밀번호는 8자 이상, 대소문자/숫자/특수문자를 포함해야 합니다")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "비밀번호는 8자 이상, 대소문자/숫자/특수문자를 포함해야 합니다"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다")
    .required("비밀번호가 일치하지 않습니다"),
  nickname: yup
    .string()
    .required("닉네임은 2~20자 이내여야 합니다")
    .matches(/^[가-힣a-zA-Z0-9]{2,20}$/, "닉네임은 2~20자 이내여야 합니다"),
  phone: yup
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v))
    .matches(/^010[0-9]{8}$/, {
      message: "휴대폰 번호 형식이 올바르지 않습니다",
      excludeEmptyString: true,
    }),
  terms: yup.boolean().oneOf([true], "약관에 동의해야 가입할 수 있습니다"),
});

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

  const onSubmit = async (data) => {
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      setLoading(false);
      if (data.email.includes("exists")) {
        alert("이미 존재하는 이메일입니다");
        return;
      }
      alert("회원가입 성공! 이메일을 확인하세요.");
      navigate("/"); // go to login
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/10 via-emerald-100/40 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Brand/Intro Pane */}
        <div className="hidden md:block">
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-emerald-100 shadow-sm p-8 h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 text-emerald-600 mb-4">
              <div className="text-3xl">🚲</div>
              <div className="text-2xl font-extrabold tracking-tight">타슈</div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
              대전 시민공영자전거
            </h2>
            <p className="text-gray-600 mb-6">
              녹색 성장을 선도하는 친환경 자전거 대여 시스템. 간단한 회원가입 후, 가까운 대여소에서 자전거를 이용해 보세요.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="text-emerald-600">•</span> 간편한 QR 대여</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600">•</span> CO₂ 절감 포인트 적립</li>
              <li className="flex items-center gap-2"><span className="text-emerald-600">•</span> 반납소까지 네비게이션</li>
            </ul>
          </div>
        </div>

        {/* Signup Card */}
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl mb-3">🚲</div>
              <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
              <p className="text-gray-500 text-sm mt-1">몇 가지 정보만 입력하면 바로 시작할 수 있어요</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="비밀번호"
                    autoComplete="new-password"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">최소 8자, 대/소문자+숫자+특수문자 포함</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✅</span>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="비밀번호 확인"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(onSubmit)(); }}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="닉네임"
                  {...register("nickname")}
                />
                {errors.nickname && (
                  <p className="mt-1 text-xs text-red-600">{errors.nickname.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">휴대폰 (선택)</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                  <input
                    type="tel"
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="01012345678"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  {...register("terms")}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  약관에 동의합니다
                </label>
              </div>
              {errors.terms && (
                <p className="-mt-2 text-xs text-red-600">{errors.terms.message}</p>
              )}

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-lg py-2.5 px-4 hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    가입 중...
                  </>
                ) : (
                  <>회원가입</>
                )}
              </button>
            </form>

            <div className="mt-6 text-sm text-gray-600 text-center">
              <Link to="/" className="text-emerald-600 hover:underline">로그인</Link>
              <span className="mx-2">•</span>
              <a href="#" className="text-emerald-600 hover:underline">이용약관</a>
              <span className="mx-2">•</span>
              <a href="#" className="text-emerald-600 hover:underline">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
