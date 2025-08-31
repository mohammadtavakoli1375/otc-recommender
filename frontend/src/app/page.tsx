import HeaderCompact from "@/components/home/HeaderCompact";
import SearchBar from "@/components/home/SearchBar";
import QuickActions from "@/components/home/QuickActions";
import ServicesGrid from "@/components/home/ServicesGrid";
import HeroBanner from "@/components/home/HeroBanner";
import EducationalCategories from "@/components/home/EducationalCategories";
import PopularContent from "@/components/home/PopularContent";
import EducationalAlert from "@/components/home/EducationalAlert";
import QuickFAQ from "@/components/home/QuickFAQ";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import DarkModeToggle from "@/components/home/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderCompact />
      <div className="pb-20 md:pb-4">
        <SearchBar />
        <QuickActions />
        <ServicesGrid />
        <HeroBanner />
        <EducationalCategories />
        <PopularContent />
        <EducationalAlert />
        <QuickFAQ />
      </div>
      <BottomNavigation />
      <DarkModeToggle />
    </div>
  );
}
