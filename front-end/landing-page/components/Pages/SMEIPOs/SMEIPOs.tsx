import Hero from './Hero/Hero'
import WhyInvest from './WhyInvest/WhyInvest'
import HowToApply from './HowToApply/HowToApply'
import OngoingSmeIpos from './OngoingSMEIPOs/OngoingSMEIPOs'
import UpcomingSmeIpos from './UpcomingSMEIPOs/UpcomingSmeIpos'
import SmeIpoFilters from './Filter&Search/Filter&Search'
import SmeIpoFAQs from './SmeFAQs/SmeFAQs'


export default function SMEIPOs(){
    return (
        <section className="mt-20 w-full">
            <Hero />
            <SmeIpoFilters />
            <WhyInvest />
            <HowToApply />
            {/* <OngoingSmeIpos /> */}
            {/* <UpcomingSmeIpos /> */}
            <SmeIpoFAQs />
        </section>
    )
}