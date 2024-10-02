import React from 'react'

import TopBarComponent from './TopBarComponent'
import HomePageComponent from './HomePageComponent'

function ContentWrapper() {

    return (
        <>
            <div className="bg-white">

                <TopBarComponent />
                <HomePageComponent/>
               

            </div>

        </>
    )
}

export default ContentWrapper