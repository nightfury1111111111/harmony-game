import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function OrgDetails({ charity }) {


    return (<div className="card bordered compact bg-gray-800 mt-4">
        <figure className="mb-2">
            <img src={charity?.organisationBanner} />

        </figure>

        <div className="card-body">
            <p className="font-bold">About</p>
            <p className="font-thin">{charity?.description?.substring(0, 200) + (charity?.description?.length > 200 ? "..." : "")}</p>
            <div className="mt-2">
                <p><FontAwesomeIcon icon="envelope" />{charity?.contactDetails?.email}</p>
                <p><FontAwesomeIcon icon="globe" />{charity?.contactDetails?.site}</p>
                <p><FontAwesomeIcon icon={["fab", "facebook"]} />{charity?.contactDetails?.facebook}</p>
                <p><FontAwesomeIcon icon={["fab", "twitter"]} />{charity?.contactDetails?.twitter}</p>
                <p><FontAwesomeIcon icon="phone-square" />{charity?.contactDetails?.phone}</p>
            </div>

        </div>
    </div>);
}

export default OrgDetails;