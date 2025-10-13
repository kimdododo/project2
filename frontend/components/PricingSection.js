import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";
import { Check } from "lucide-react";
import pricingPlans from "@/data/pricing";

const Pricing = () => {
  const plans = pricingPlans;

  return (
    <section className="bg-base-100 overflow-hidden" id="pricing">
      <div className="py-24 px-8 max-w-5xl mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <p className="font-medium text-primary mb-8">Pricing</p>
          <h2 className="font-bold text-3xl lg:text-5xl tracking-tight">
            반복적인 코드는 이제 그만.
          </h2>
          <p className="text-base-content/80 mt-4">
            비용과 시간을 절약하고 당신의 서비스를 바로 출시해보세요! 한번
            구매하면 평생 사용할 수 있습니다.
          </p>
        </div>

        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="relative w-full max-w-lg">
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span
                    className={`badge text-xs text-primary-content font-semibold border-0 bg-primary`}
                  >
                    POPULAR
                  </span>
                </div>
              )}

              {plan.isFeatured ? (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-primary z-10`}
                ></div>
              ) : (
                <div
                  className={`absolute -inset-[1px] rounded-[9px] bg-base-content/10 z-10`}
                ></div>
              )}

              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-lg">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-lg lg:text-xl font-bold">{plan.name}</p>
                    {plan.description && (
                      <p className="text-base-content/80 mt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {plan.priceAnchor && (
                    <div className="flex flex-col justify-end mb-[4px] text-lg ">
                      <p className="relative">
                        <span className="absolute bg-base-content h-[1.5px] inset-x-0 top-[53%]"></span>
                        <span className="text-base-content/80">
                          ${plan.priceAnchor}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className={`text-5xl tracking-tight font-extrabold`}>
                    {plan.amount.toLocaleString()}
                  </p>
                  <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-base text-base-content/60 uppercase font-semibold">
                      원
                    </p>
                  </div>
                </div>
                {plan.features && (
                  <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {feature.isShow ? (
                          <Check className="w-[18px] h-[18px] opacity-80 shrink-0" />
                        ) : (
                          <span className="w-[18px] h-[18px] shrink-0" />
                        )}

                        <span
                          className={` ${
                            feature.isShow ? "" : "text-gray-300"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  <ButtonCheckout priceId={plan.priceId} item={plan} />

                  <p className="flex items-center justify-center gap-2 text-sm text-center text-base-content/80 font-medium relative">
                    한번 구매하고 평생 사용하기
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
