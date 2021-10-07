import {Fragment, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import EventList from '../../components/events/event-list';
import ResultsTitle from '../../components/events/results-title';
import Button from '../../components/ui/button';
import ErrorAlert from '../../components/ui/error-alert';
import Head from 'next/head'

function FilteredEventsPage(props) {
    console.log()

    const [loadedEvents, setLoadedEvents] = useState();
    const router = useRouter();

    const filterData = router.query.slug;

    const {data, error} = useSWR(
        'https://react-next-events-default-rtdb.firebaseio.com/events.json'
    );

    useEffect(() => {
        if (data) {
            const events = [];

            for (const key in data) {
                events.push({
                    id: key,
                    ...data[key],
                });
            }

            setLoadedEvents(events);
        }
    }, [data]);

    let numYear;
    let numMonth;


    if (!loadedEvents) {
        return <>{getHead()}<p className='center'>Loading...</p></>;
    }


    const filteredYear = filterData[0];
    const filteredMonth = filterData[1];

    numYear = +filteredYear;
    numMonth = +filteredMonth;

    function getHead() {
        return (
            <Head>
                <title>Filtered Events</title>
                <meta name={'description'} content={`All events for ${numMonth}/${numYear}`}/>

            </Head>)
    }

    if (
        isNaN(numYear) ||
        isNaN(numMonth) ||
        numYear > 2030 ||
        numYear < 2021 ||
        numMonth < 1 ||
        numMonth > 12 ||
        error
    ) {
        return (
            <Fragment>
                {getHead()}
                <ErrorAlert>
                    <p>Invalid filter. Please adjust your values!</p>
                </ErrorAlert>
                <div className='center'>
                    <Button link='/events'>Show All Events</Button>
                </div>
            </Fragment>
        );
    }

    const filteredEvents = loadedEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return (
            eventDate.getFullYear() === numYear &&
            eventDate.getMonth() === numMonth - 1
        );
    });

    if (!filteredEvents || filteredEvents.length === 0) {
        return (
            <Fragment>
                {getHead()}
                <ErrorAlert>
                    <p>No events found for the chosen filter!</p>
                </ErrorAlert>
                <div className='center'>
                    <Button link='/events'>Show All Events</Button>
                </div>
            </Fragment>
        );
    }

    const date = new Date(numYear, numMonth - 1);


    return (
        <Fragment>
            {getHead()}
            <ResultsTitle date={date}/>
            <EventList items={filteredEvents}/>
        </Fragment>
    );
}

// export async function getServerSideProps(context) {
//   const { params } = context;
//   console.log(params)
//   const filterData = params.slug;
//
//   const filteredYear = filterData[0];
//   const filteredMonth = filterData[1];
//
//   const numYear = +filteredYear;
//   const numMonth = +filteredMonth;
//
//   if (
//     isNaN(numYear) ||
//     isNaN(numMonth) ||
//     numYear > 2030 ||
//     numYear < 2021 ||
//     numMonth < 1 ||
//     numMonth > 12
//   ) {
//     return {
//       props: { hasError: true },
//       // notFound: true,
//       // redirect: {
//       //   destination: '/error'
//       // }
//     };
//   }
//
//   const filteredEvents = await getFilteredEvents({
//     year: numYear,
//     month: numMonth,
//   });
//
//   return {
//     props: {
//       events: filteredEvents,
//       date: {
//         year: numYear,
//         month: numMonth,
//       },
//     },
//   };
// }

export default FilteredEventsPage;
