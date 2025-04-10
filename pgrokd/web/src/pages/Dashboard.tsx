import { Disclosure, Menu, Transition } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import useUser from "../hooks/useUser";

export default function DashboardPage() {
  const user = useUser();

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="border-b border-gray-200 bg-white">
          {() => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <div className="flex flex-shrink-0 items-center">
                      <img className="block h-8 w-auto lg:hidden" src="/pgrok.svg" />
                      <img className="hidden h-8 w-auto lg:block" src="/pgrok.svg" />
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            item.current
                              ? "border-indigo-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">用户菜单</span>
                          <UserCircleIcon className="h-8 w-8 rounded-full" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            <a href="/-/sign-out" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              退出
                            </a>
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>

        <div className="py-10">
          <header className="pb-5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">控制台</h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div>
                <div className="px-4 sm:px-0">
                  <h3 className="text-base font-semibold leading-7 text-gray-900">用户信息</h3>
                </div>
                <div className="mt-6 border-t border-gray-100">
                  <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">用户名</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{user.displayName}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">Token</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <code>{user.token}</code>
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">公网地址</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <a
                          className="underline text-blue-600 hover:text-blue-800"
                          target="_blank"
                          rel="noreferrer"
                          href={user.url}
                        >
                          {user.url}
                        </a>
                        <ArrowTopRightOnSquareIcon
                          className="h-5 w-5 flex-shrink-0 text-gray-400 inline-block pl-1"
                          aria-hidden="true"
                        />
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">运行方法</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <h6>先配置</h6>
                        <code>$ pgrok init --remote-addr nmmm.top:2222 --forward-addr http://localhost:port --token {user.token}</code>
                        <br />
                        <h6>然后运行</h6>
                        <code>$ pgrok</code>
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-gray-900">pgrok客户端下载</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <h6 className="text-blue-700 font-semibold">Windows平台</h6>
                        <a className="text-blue-500 underline" href="https://gh-proxy.com/github.com/pgrok/pgrok/releases/download/v1.4.5/pgrok_1.4.5_windows_amd64.zip">amd64</a><br />
                        <a className="text-blue-500 underline" href="https://gh-proxy.com/github.com/pgrok/pgrok/releases/download/v1.4.5/pgrok_1.4.5_windows_arm64.zip">arm64</a>
                        <br />
                        <h6 className="text-blue-700 font-semibold">Linux平台</h6>
                        <a className="text-blue-500 underline" href="https://gh-proxy.com/github.com/pgrok/pgrok/releases/download/v1.4.5/pgrok_1.4.5_linux_amd64.tar.gz">amd64(普通服务器,x86软路由)</a><br />
                        <a className="text-blue-500 underline" href="https://gh-proxy.com/github.com/pgrok/pgrok/releases/download/v1.4.5/pgrok_1.4.5_linux_arm64.tar.gz">arm64(arm路由器自行尝试)</a>
                        <br />
                        <h6 className="text-blue-700 font-semibold">Mac平台</h6>
                        <a className="text-blue-500 underline" href="https://gh-proxy.com/github.com/pgrok/pgrok/releases/download/v1.4.5/pgrok_1.4.5_darwin_amd64.tar.gz">amd64(黑苹果,2020之前的mac)</a><br />
                        <a className="text-blue-500 underline" href="https://gh-proxy.com/github.com/pgrok/pgrok/releases/download/v1.4.5/pgrok_1.4.5_darwin_arm64.tar.gz">arm64(2020后的mac)</a>
                        <br />
                      </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium leading-6 text-green-900">使用须知</dt>
                      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                        <p>感谢您选择我们的免费内网穿透服务！本服务由个人开发者独立维护,自动HTTPS,旨在为开发者、测试人员及小型项目提供便捷的内网穿透支持,免费≠无度,我们坚信技术共享的力量,但也需要每一位用户的共同守护。请您仔细阅读以下条款,合理使用资源,与我们携手维持服务的长期稳定,技术交流联系QQ 995433059</p>
                        <br />
                        <div className="flex">
                          <ul className="flex-5">
                            <li><span className="font-bold text-orange-400">使用限制:</span>免费提供约2mbps(200kb/s)的带宽,一个uuid的二级域名</li>
                            <li><span className="font-bold text-orange-400">不可保证:</span>免费内网穿透服务器是为爱发电,不承诺可用性(SLA)</li>
                            <li><span className="font-bold text-orange-400">资源有限:</span>可能根据负载动态调整或暂停新用户注册</li>
                            <li><span className="font-bold text-orange-400">违法用途:</span>禁止传播违法信息、网络攻击、侵犯隐私、破解商业系统等行为</li>
                            <li><span className="font-bold text-orange-400">商业滥用:</span>不得用于商业盈利、大规模分发、直播推流等高负载场景</li>
                            <li><span className="font-bold text-orange-400">安全底线:</span>严禁扫描攻击服务器、尝试漏洞利用、干扰其他用户正常使用。</li>
                            <li><span className="font-bold text-orange-400">测试优先:</span>建议用于开发调试、临时演示,非必要请勿7x24小时运行。</li>
                            <li><span className="font-bold text-orange-400">及时清理:</span>长期未使用的隧道将定期回收,释放资源给更多用户。</li>
                            <li><span className="font-bold text-orange-400">共享精神:</span>欢迎技术交流,但请勿公开分享敏感配置(如token)或诱导他人滥用</li>
                            <li>打赏后联系<a className="underline font-bold" href="mailto:lsplub@gmail.com">站长邮箱</a>(附上现有公网地址)可以申请一次自定义二级域名,先到先得</li>
                          </ul>
                          <div className="flex-2 mx-2 flex flex-col">
                            <h5 className="text-center">打赏码</h5>
                            <div className="flex-2 flex flex-row">
                              <img src="/alipay.jpg" alt="支付宝" className="mx-2 w-32" />
                              <img src="/wechat.jpg" alt="微信支付" className="mx-2 w-32" />
                            </div>
                          </div>
                        </div>
                        <br />
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

const navigation = [{ name: "控制台", href: "/", current: true }];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
