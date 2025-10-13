"use client";

import { useState, useEffect } from "react";
import { Popover, Transition } from "@headlessui/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { ChevronDown, LogOut } from "lucide-react";

const ButtonAccount = () => {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
    };

    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Popover className="relative z-10">
      {({ open }) => (
        <>
          <Popover.Button className="btn">
            {user?.user_metadata?.avatar_url ? (
              <Image
                src={user?.user_metadata?.avatar_url}
                alt="Profile picture"
                className="rounded-full shrink-0"
                width={24}
                height={24}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="w-8 h-8 bg-base-100 flex justify-center items-center rounded-full shrink-0 capitalize">
                {user?.email?.charAt(0)}
              </span>
            )}

            {user?.user_metadata?.name ||
              user?.email?.split("@")[0] ||
              "Account"}

            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <ChevronDown
                className={`w-5 h-5 duration-200 opacity-50 ${
                  open ? "transform rotate-180" : ""
                }`}
              />
            )}
          </Popover.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="absolute left-0 z-10 mt-3 w-screen max-w-[16rem] transform">
              <div className="overflow-hidden rounded-xl shadow-xl ring-1 ring-base-content ring-opacity-5 bg-base-100 p-1">
                <div className="space-y-0.5 text-sm">
                  <button
                    className="flex items-center gap-2 hover:bg-error/20 hover:text-error duration-200 py-1.5 px-4 w-full rounded-lg font-medium"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default ButtonAccount;
