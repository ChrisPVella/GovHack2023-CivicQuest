import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MagnifyingGlassIcon,
  GiftTopIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";

import benefitOneImg from "../public/img/benefit-one.png";
import benefitTwoImg from "../public/img/benefit-two.png";

import toursJpg from './tours.jpg';

const benefitOne = {
  title: "There's something for everyone",
  desc: "Whether you're a tourist looking for a one-of-a-kind travel experience or a local who wants to re-discover the gems in your own backyard, CivicQuest makes it easy. Just tap into our database of hundreds of points of interest, interact with AI-generated quests, and start your journey.",
  image: toursJpg,
  bullets: [
    {
      title: "Interactive tours",
      desc: "Explore your city through gamified, interactive tours",
      icon: <MagnifyingGlassIcon />,
    },
    {
      title: "Challenges and rewards",
      desc: "Complete challenges and quests to earn points and unlock rewards",
      icon: <GiftTopIcon />,
    },
    {
      title: "Uncover the unknown",
      desc: "Discover hidden gems and local hotspots tailored to your interests",
      icon: <SparklesIcon />,
    },
    {
      title: "Support local",
      desc: "Support local businesses and venues with special discounts and deals",
      icon: <BuildingStorefrontIcon />,
    },
    {
      title: "Join a community",
      desc: "Compete and collaborate with other users via leaderboards and social features",
      icon: <FaceSmileIcon />,
    },
  ],
};

export { benefitOne };
