// components/PaginationUI.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
export default function PaginationUI(props: {
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  

  const pushWithParams = (page: number) => {
    const q = new URLSearchParams(sp.toString());
    q.set("page", String(page));
    router.push(`?${q.toString()}`);
  };

  const handleClickToNextPage = () => {
    const nextPage = props.currentPage + 1;
    pushWithParams(nextPage);
  };

  const handleClickPrevPage = () => {
    const prev = props.currentPage - 1;
    pushWithParams(prev);
  };

  return (
    <div className="mt-8 flex flex-wrap gap-2 justify-center">
      <button
        onClick={handleClickPrevPage}
        disabled={props.currentPage === 1}
        className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded disabled:opacity-50"
      >
        Precedant
      </button>
      <button
        onClick={handleClickToNextPage}
        disabled={props.currentPage === props.totalPages}
        className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded disabled:opacity-50"
      >
        Suivant
      </button>
      <div className="flex items-center bg-gray-100 ml-3 p-2 rounded-lg shadow-md">
        <span className="text-gray-700 font-semibold">
          Page actuel
          <span className="font-bold text-blue-600">{props.currentPage}</span>{" "}
          de
          <span className="font-bold text-blue-600">{props.totalPages}</span>
        </span>
      </div>
    </div>
  );
}
