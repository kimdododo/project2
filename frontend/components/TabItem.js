"use client";

import React from "react";
import { cn } from "@/libs/utils";

// 탭 아이템 사용법 예시
// function SimpleTabSection() {
//   const [selectedTab, setSelectedTab] = useState('특징')

//   return (
//     <section className="container mx-auto py-10">
//       <TabItem
//         items={['특징', '가격', 'FAQ']}
//         selectedItem={selectedTab}
//         onItemChange={setSelectedTab}
//         className="mb-6"
//       />
//       {selectedTab === '특징' && <FeaturesAccordionSection />}
//       {selectedTab === '가격' && <PricingSection />}
//       {selectedTab === 'FAQ' && <FAQSection />}
//     </section>
//   )
// }

function TabItem({
  items = [], // 탭 아이템 배열
  selectedItem, // 선택된 아이템
  onItemChange, // 아이템 변경 핸들러
  className, // 추가 스타일링을 위한 className
  itemClassName, // 각 탭 아이템의 스타일링을 위한 className
  activeClassName = "tab-active", // 활성 탭의 스타일링
  renderItem, // 커스텀 렌더링을 위한 함수
}) {
  return (
    <div
      role="tablist"
      className={cn("tabs tabs-boxed p-0 bg-white w-full gap-2", className)}
    >
      {items.map((item) => (
        <a
          key={typeof item === "object" ? item.id || item.value : item}
          role="tab"
          className={cn(
            "tab h-[46px] border border-black transition-all duration-500 ease-in-out",
            itemClassName,
            selectedItem === item && activeClassName
          )}
          onClick={() => onItemChange(item)}
        >
          {renderItem
            ? renderItem(item)
            : typeof item === "object"
            ? item.label
            : item}
        </a>
      ))}
    </div>
  );
}

export default TabItem;
