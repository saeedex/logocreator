"use client"

import Spinner from "@/app/components/Spinner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { motion } from "framer-motion"
import { Textarea } from "@/app/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { SignInButton, useUser } from "@clerk/nextjs"
import { DownloadIcon, RefreshCwIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { domain } from "@/app/lib/domain"
import InfoTooltip from "./components/InfoToolTip"

// const layouts = [
//   { name: "Solo", icon: "/solo.svg" },
//   { name: "Side", icon: "/side.svg" },
//   { name: "Stack", icon: "/stack.svg" },
// ];

// const logoStyles = [
//   { name: "Tech", icon: "/tech.svg" },
//   { name: "Flashy", icon: "/flashy.svg" },
//   { name: "Modern", icon: "/modern.svg" },
//   { name: "Playful", icon: "/playful.svg" },
//   { name: "Abstract", icon: "/abstract.svg" },
//   { name: "Minimal", icon: "/minimal.svg" },
// ]

const primaryColors = [
  { name: "Blue", color: "#0F6FFF" },
  { name: "Red", color: "#FF0000" },
  { name: "Green", color: "#00FF00" },
  { name: "Yellow", color: "#FFFF00" },
]

const backgroundColors = [
  { name: "White", color: "#FFFFFF" },
  { name: "Gray", color: "#CCCCCC" },
  { name: "Black", color: "#000000" },
]

export default function Page() {
  const [userAPIKey, setUserAPIKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userAPIKey") || ""
    }
    return ""
  })
  const [companyName, setCompanyName] = useState("")
  // const [selectedLayout, setSelectedLayout] = useState(layouts[0].name);
  // const [selectedStyle, setSelectedStyle] = useState(logoStyles[0].name)
  // const [selectedPrimaryColor, setSelectedPrimaryColor] = useState(primaryColors[0].name)
  // const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(backgroundColors[0].name)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedImage1, setGeneratedImage1] = useState<string | null>(null)
  const [generatedImage2, setGeneratedImage2] = useState<string | null>(null)
  const [generatedImage3, setGeneratedImage3] = useState<string | null>(null)
  const [generatedImage4, setGeneratedImage4] = useState<string | null>(null)

  const { isSignedIn, isLoaded, user } = useUser()

  // const handleAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newValue = e.target.value
  //   setUserAPIKey(newValue)
  //   localStorage.setItem("userAPIKey", newValue)
  // }

  async function generateLogo() {
    if (!isSignedIn) {
      return
    }

    setIsLoading(true)

    // Create a helper function to translate
    const translateText = async (text: string, brandName: boolean): Promise<string> => {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, userAPIKey, brandName}),
      });
    
      if (!res.ok) {
        const err = await res.text();
        console.error("Translation error:", err);
        throw new Error("Translation failed");
      }
    
      const json = await res.json();
      return json.translatedText;
    };    

    // Create a helper function to fetch logo
    const fetchLogo = async (setImage: React.Dispatch<React.SetStateAction<string | null>>, primaryColor: string, backgroundColor: string, drawText: boolean, tname: string, tinfo: string) => {
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        body: JSON.stringify({
          userAPIKey,
          companyName: tname,
          selectedStyle: "Abstract", 
          selectedPrimaryColor: primaryColor,
          selectedBackgroundColor: backgroundColor,
          additionalInfo: tinfo,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        
        if (drawText) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = document.createElement('img');
          img.src = `data:image/png;base64,${json.b64_json}`;
          img.onload = () => {
            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Check if ctx is not null
            if (ctx) {
              // Draw the image on the canvas
              ctx.drawImage(img, 0, 0);

              // Add text on top of the image
              ctx.font = '60px Arial';
              ctx.fillStyle = 'black'
              ctx.fillText(tname, 300, 700);

              // Convert canvas to image and set it to state
              const finalImage = canvas.toDataURL('image/png');
              setImage(finalImage);
              return finalImage
            } else {
              console.error("Failed to get canvas context");
              return null
            }
          };
        } else {
          const image = `data:image/png;base64,${json.b64_json}`
          setImage(image)
          return image
        }
      } else if (res.headers.get("Content-Type") === "text/plain") {
        toast({
          variant: "destructive",
          title: res.statusText,
          description: await res.text(),
        })
      } else {
        toast({
          variant: "destructive",
          title: "Whoops!",
          description: `There was a problem processing your request: ${res.statusText}`,
        })
      }
      return null
    }

    const [translatedCompanyName, translatedAdditionalInfo] = await Promise.all([
      translateText(companyName, true),
      translateText(additionalInfo, false),
    ]);
    
    // Generate logos
    await Promise.all([
      fetchLogo(setGeneratedImage1, primaryColors[Math.floor(Math.random() * primaryColors.length)].name, backgroundColors[0].name, false, translatedCompanyName, translatedAdditionalInfo),
      fetchLogo(setGeneratedImage2, primaryColors[Math.floor(Math.random() * primaryColors.length)].name, backgroundColors[0].name, true, translatedCompanyName, translatedAdditionalInfo),
      fetchLogo(setGeneratedImage3, primaryColors[Math.floor(Math.random() * primaryColors.length)].name, backgroundColors[0].name, false, translatedCompanyName, translatedAdditionalInfo),
      fetchLogo(setGeneratedImage4, primaryColors[Math.floor(Math.random() * primaryColors.length)].name, backgroundColors[0].name, false, translatedCompanyName, translatedAdditionalInfo),
    ])

    await user.reload()
    setIsLoading(false)
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto overflow-x-hidden bg-white md:flex-row">
      <Header className="block md:hidden" />

      <div className="flex w-full flex-col md:flex-row">
        <div className="relative flex h-full w-full flex-col bg-white text-gray-800 md:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setGeneratedImage1(null)
              setGeneratedImage2(null)
              setGeneratedImage3(null)
              setGeneratedImage4(null)
              generateLogo()
            }}
            className="flex h-full w-full flex-col"
          >
            <fieldset className="flex grow flex-col" disabled={!isSignedIn}>
              <div className="flex-grow overflow-y-auto">
                <div className="px-8 pb-0 pt-4 md:px-6 md:pt-6">
                  <div className="mb-6">
                    <label htmlFor="company-name" className="mb-2 block text-xs font-bold uppercase text-gray-600">
                        브랜드 이름
                    </label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="사랑"
                      required
                      className="bg-white"
                    />
                  </div>
                  {/* Layout Section */}
                  {/* <div className="mb-6">
                    <label className="mb-2 flex items-center text-xs font-bold uppercase text-gray-600">
                      Layout
                      <InfoTooltip content="Select a layout for your logo" />
                    </label>
                    <RadioGroup.Root
                      value={selectedLayout}
                      onValueChange={setSelectedLayout}
                      className="group/root grid grid-cols-3 gap-3"
                    >
                      {layouts.map((layout) => (
                        <RadioGroup.Item
                          value={layout.name}
                          key={layout.name}
                          className="group text-gray-600 focus-visible:outline-none data-[state=checked]:text-white"
                        >
                          <Image
                            src={layout.icon || "/placeholder.svg"}
                            alt={layout.name}
                            width={96}
                            height={96}
                            className="w-full rounded-md border border-transparent group-focus-visible:outline group-focus-visible:outline-offset-2 group-focus-visible:outline-gray-400 group-data-[state=checked]:border-white"
                          />
                          <span className="text-xs">{layout.name}</span>
                        </RadioGroup.Item>
                      ))}
                    </RadioGroup.Root>
                  </div> */}                  
                  {/* Color Picker Section */}
                  {/*<div className="mb-[25px] flex flex-col md:flex-row md:space-x-3">
                    <div className="mb-4 flex-1 md:mb-0">
                      <label className="mb-1 block text-xs font-bold uppercase text-gray-600">선호 색상</label>
                      <Select value={selectedPrimaryColor} onValueChange={setSelectedPrimaryColor}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {primaryColors.map((color) => (
                              <SelectItem key={color.color} value={color.name}>
                                <span className="flex items-center">
                                  <span
                                    style={{ backgroundColor: color.color }}
                                    className="mr-2 size-4 rounded-sm bg-white"
                                  />
                                  {color.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block items-center text-xs font-bold uppercase text-gray-600">
                        배경색
                      </label>
                      <Select value={selectedBackgroundColor} onValueChange={setSelectedBackgroundColor}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {backgroundColors.map((color) => (
                              <SelectItem key={color.color} value={color.name}>
                                <span className="flex items-center">
                                  <span
                                    style={{ backgroundColor: color.color }}
                                    className="mr-2 size-4 rounded-sm bg-white"
                                  />
                                  {color.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>*/}
                  {/* Additional Options Section */}
                  <div className="mb-1">
                    <div className="mt-1">
                      <div className="mb-1">
                        <label
                          htmlFor="additional-info"
                          className="mb-2 flex items-center text-xs font-bold uppercase text-gray-600"
                        >
                          설명
                          <InfoTooltip content="Provide any additional information about your logo" />
                        </label>
                        <Textarea
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="꽃과 선물 배달"
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-8 py-4 md:px-6 md:py-6">
                <Button
                  size="lg"
                  className="w-full text-base font-bold bg-gray-200 text-gray hover:bg-gray-400"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="loader mr-2" />
                  ) : (
                    <Image
                      src="/generate-icon.svg"
                      alt="Generate Icon"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                  )}
                  {isLoading ? "Loading..." : "Generate"}{" "}
                </Button>
              </div>
            </fieldset>
          </form>

          {isLoaded && !isSignedIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 px-6"
            >
              <div className="rounded bg-gray-200 p-4 text-gray-900">
                <p className="text-lg">로고 제작을 시작하려면 무료 계정을 만드세요:</p>

                <div className="mt-4">
                  <SignInButton mode="modal" signUpForceRedirectUrl={domain} forceRedirectUrl={domain}>
                    <Button size="lg" className="w-full text-base font-semibold" variant="secondary">
                      Sign in
                    </Button>
                  </SignInButton>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex w-full flex-col pt-12 md:pt-0">
          <Header className="hidden md:block" /> {/* Show header on larger screens */}
          <div className="relative flex flex-grow items-center justify-center px-4">
            <div className="relative aspect-square w-full max-w-lg">
              {generatedImage1 && generatedImage2 && generatedImage3 && generatedImage4 ? (
                <>
                  <div className="grid grid-cols-2 gap-16">
                    <div className="relative">
                      <Image
                        className={`${isLoading ? "animate-pulse" : ""}`}
                        width={512}
                        height={512}
                        src={generatedImage1 || "/placeholder.svg"}
                        alt=""
                      />
                      <div className="absolute -right-12 top-0 flex flex-col gap-2">
                        <Button size="icon" variant="secondary" asChild>
                          <a href={generatedImage1} download="logo.png">
                            <DownloadIcon />
                          </a>
                        </Button>
                        <Button size="icon" onClick={generateLogo} variant="secondary">
                          <Spinner loading={isLoading}>
                            <RefreshCwIcon />
                          </Spinner>
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Image
                        className={`${isLoading ? "animate-pulse" : ""}`}
                        width={512}
                        height={512}
                        src={generatedImage2 || "/placeholder.svg"}
                        alt=""
                      />
                      <div className="absolute -right-12 top-0 flex flex-col gap-2">
                        <Button size="icon" variant="secondary" asChild>
                            <a href={generatedImage2} download="logo.png">
                              <DownloadIcon />
                            </a>
                        </Button>
                        <Button size="icon" onClick={generateLogo} variant="secondary">
                          <Spinner loading={isLoading}>
                            <RefreshCwIcon />
                          </Spinner>
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Image
                        className={`${isLoading ? "animate-pulse" : ""}`}
                        width={512}
                        height={512}
                        src={generatedImage3 || "/placeholder.svg"}
                        alt=""
                      />
                      <div className="absolute -right-12 top-0 flex flex-col gap-2">
                        <Button size="icon" variant="secondary" asChild>
                            <a href={generatedImage3} download="logo.png">
                              <DownloadIcon />
                            </a>
                        </Button>
                        <Button size="icon" onClick={generateLogo} variant="secondary">
                          <Spinner loading={isLoading}>
                            <RefreshCwIcon />
                          </Spinner>
                        </Button>
                      </div>
                    </div>

                    <div className="relative">
                      <Image
                        className={`${isLoading ? "animate-pulse" : ""}`}
                        width={512}
                        height={512}
                        src={generatedImage4 || "/placeholder.svg"}
                        alt=""
                      />
                      <div className="absolute -right-12 top-0 flex flex-col gap-2">
                        <Button size="icon" variant="secondary" asChild>
                            <a href={generatedImage4} download="logo.png">
                              <DownloadIcon />
                            </a>
                        </Button>
                        <Button size="icon" onClick={generateLogo} variant="secondary">
                          <Spinner loading={isLoading}>
                            <RefreshCwIcon />
                          </Spinner>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`pointer-events-none absolute inset-0 transition ${isLoading ? "bg-black/50 duration-500" : "bg-black/0 duration-0"}`}
                  />
                </>
              ) : (
                <Spinner loading={isLoading} className="size-8 text-gray-400">
                  <div className="flex aspect-square w-full flex-col items-center justify-center rounded-xl bg-gray-200">
                    <h4 className="text-center text-base leading-tight text-gray-800">
                      10초 안에 꿈의
                      <br />
                      로고를 만들어 보세요!
                    </h4>
                  </div>
                </Spinner>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}