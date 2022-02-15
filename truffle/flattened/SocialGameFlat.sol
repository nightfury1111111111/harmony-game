// File: @openzeppelin/contracts/utils/Context.sol

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol


pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: @openzeppelin/contracts/utils/Address.sol


pragma solidity ^0.8.0;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain`call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
      return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: value }(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

// File: @openzeppelin/contracts/utils/escrow/Escrow.sol


pragma solidity ^0.8.0;



 /**
  * @title Escrow
  * @dev Base escrow contract, holds funds designated for a payee until they
  * withdraw them.
  *
  * Intended usage: This contract (and derived escrow contracts) should be a
  * standalone contract, that only interacts with the contract that instantiated
  * it. That way, it is guaranteed that all Ether will be handled according to
  * the `Escrow` rules, and there is no need to check for payable functions or
  * transfers in the inheritance tree. The contract that uses the escrow as its
  * payment method should be its owner, and provide public methods redirecting
  * to the escrow's deposit and withdraw.
  */
contract Escrow is Ownable {
    using Address for address payable;

    event Deposited(address indexed payee, uint256 weiAmount);
    event Withdrawn(address indexed payee, uint256 weiAmount);

    mapping(address => uint256) private _deposits;

    function depositsOf(address payee) public view returns (uint256) {
        return _deposits[payee];
    }

    /**
     * @dev Stores the sent amount as credit to be withdrawn.
     * @param payee The destination address of the funds.
     */
    function deposit(address payee) public payable virtual onlyOwner {
        uint256 amount = msg.value;
        _deposits[payee] = _deposits[payee] + amount;

        emit Deposited(payee, amount);
    }

    /**
     * @dev Withdraw accumulated balance for a payee, forwarding all gas to the
     * recipient.
     *
     * WARNING: Forwarding all gas opens the door to reentrancy vulnerabilities.
     * Make sure you trust the recipient, or are either following the
     * checks-effects-interactions pattern or using {ReentrancyGuard}.
     *
     * @param payee The address whose funds will be withdrawn and transferred to.
     */
    function withdraw(address payable payee) public virtual onlyOwner {
        uint256 payment = _deposits[payee];

        _deposits[payee] = 0;

        payee.sendValue(payment);

        emit Withdrawn(payee, payment);
    }
}

// File: @openzeppelin/contracts/utils/escrow/ConditionalEscrow.sol


pragma solidity ^0.8.0;


/**
 * @title ConditionalEscrow
 * @dev Base abstract escrow to only allow withdrawal if a condition is met.
 * @dev Intended usage: See {Escrow}. Same usage guidelines apply here.
 */
abstract contract ConditionalEscrow is Escrow {
    /**
     * @dev Returns whether an address is allowed to withdraw their funds. To be
     * implemented by derived contracts.
     * @param payee The destination address of the funds.
     */
    function withdrawalAllowed(address payee) public view virtual returns (bool);

    function withdraw(address payable payee) public virtual override {
        require(withdrawalAllowed(payee), "ConditionalEscrow: payee is not allowed to withdraw");
        super.withdraw(payee);
    }
}

// File: @openzeppelin/contracts/utils/escrow/RefundEscrow.sol


pragma solidity ^0.8.0;


/**
 * @title RefundEscrow
 * @dev Escrow that holds funds for a beneficiary, deposited from multiple
 * parties.
 * @dev Intended usage: See {Escrow}. Same usage guidelines apply here.
 * @dev The owner account (that is, the contract that instantiates this
 * contract) may deposit, close the deposit period, and allow for either
 * withdrawal by the beneficiary, or refunds to the depositors. All interactions
 * with `RefundEscrow` will be made through the owner contract.
 */
contract RefundEscrow is ConditionalEscrow {
    using Address for address payable;

    enum State { Active, Refunding, Closed }

    event RefundsClosed();
    event RefundsEnabled();

    State private _state;
    address payable immutable private _beneficiary;

    /**
     * @dev Constructor.
     * @param beneficiary_ The beneficiary of the deposits.
     */
    constructor (address payable beneficiary_) {
        require(beneficiary_ != address(0), "RefundEscrow: beneficiary is the zero address");
        _beneficiary = beneficiary_;
        _state = State.Active;
    }

    /**
     * @return The current state of the escrow.
     */
    function state() public view virtual returns (State) {
        return _state;
    }

    /**
     * @return The beneficiary of the escrow.
     */
    function beneficiary() public view virtual returns (address payable) {
        return _beneficiary;
    }

    /**
     * @dev Stores funds that may later be refunded.
     * @param refundee The address funds will be sent to if a refund occurs.
     */
    function deposit(address refundee) public payable virtual override {
        require(state() == State.Active, "RefundEscrow: can only deposit while active");
        super.deposit(refundee);
    }

    /**
     * @dev Allows for the beneficiary to withdraw their funds, rejecting
     * further deposits.
     */
    function close() public virtual onlyOwner {
        require(state() == State.Active, "RefundEscrow: can only close while active");
        _state = State.Closed;
        emit RefundsClosed();
    }

    /**
     * @dev Allows for refunds to take place, rejecting further deposits.
     */
    function enableRefunds() public onlyOwner virtual {
        require(state() == State.Active, "RefundEscrow: can only enable refunds while active");
        _state = State.Refunding;
        emit RefundsEnabled();
    }

    /**
     * @dev Withdraws the beneficiary's funds.
     */
    function beneficiaryWithdraw() public virtual {
        require(state() == State.Closed, "RefundEscrow: beneficiary can only withdraw while closed");
        beneficiary().sendValue(address(this).balance);
    }

    /**
     * @dev Returns whether refundees can withdraw their deposits (be refunded). The overridden function receives a
     * 'payee' argument, but we ignore it here since the condition is global, not per-payee.
     */
    function withdrawalAllowed(address) public view override returns (bool) {
        return state() == State.Refunding;
    }
}

// File: @openzeppelin/contracts/token/ERC721/IERC721Receiver.sol


pragma solidity ^0.8.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721.onERC721Received.selector`.
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

// File: @openzeppelin/contracts/utils/introspection/IERC165.sol


pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File: @openzeppelin/contracts/token/ERC721/IERC721.sol


pragma solidity ^0.8.0;


/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be have been allowed to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool _approved) external;

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    /**
      * @dev Safely transfers `tokenId` token from `from` to `to`.
      *
      * Requirements:
      *
      * - `from` cannot be the zero address.
      * - `to` cannot be the zero address.
      * - `tokenId` token must exist and be owned by `from`.
      * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
      * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
      *
      * Emits a {Transfer} event.
      */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}

// File: contracts/reports/Report.sol

pragma solidity >=0.4.22 <0.9.0;


/**
 * @title Report Framework
 * @notice Smart Contract developed for the Harmony One Round 2 Hackathon on Gitcoin
 * @dev On-Chain reporting of a single metric and its count defined by a key and a category.
 * It will store each in a bucket denoted by the {Report}-{getReportingPeriodFor} function,
 * which defines a bucket given a timestamp. The report is configured for weekly reporting,
 * with a week starting on Sunday. Override the {getReportingPeriodFor} to derive your own reporting period.
 *
 * Note Use the provided API to update the global report or the latest reports. When updating the latest
 * reports, the global report is also updated.
 * Designed as real-time reporting. A global report keeps track of overall accumulated values.
 *
 * Note no overflow has been added ... something to be mindful of
 *
 * @author victaphu
 */
contract Report is Ownable {
    // a report period represents a single report period start/end date
    // a sum/count for each report period is provided when updating
    // reports hold all the keyed reports for a given date range
    struct ReportPeriod {
        uint256 startRange;
        uint256 endRange;
        uint256 sum;
        uint256 count;
        bytes[] keys;
        mapping(bytes => ReportOverview) reports;
    }

    // a report overview represents the next level and represents one level
    // further of details. the focus of the report is presented as a key
    struct ReportOverview {
        uint256 sum;
        uint256 count;
        bytes[] categories;
        mapping(bytes => ReportItem) reportItems;
    }

    // reports can be further divided into report items which represent the
    // lowest level of reporting.
    struct ReportItem {
        uint256 sum;
        uint256 count;
    }

    mapping(address => bool) private _access;
    uint256 constant DAY_IN_SECONDS = 86400;

    // this represents a global overview of reports
    ReportPeriod private _overallReport;

    mapping(uint256 => ReportPeriod) private reports;

    /**
     * @dev return the latest report object using the latest timestamp to find the
     * report from reports mapping.
     *
     * @return period latest report using timestamp to derive the timeslot
     */
    function getLatestReportObject()
        internal
        view
        returns (ReportPeriod storage period)
    {
        period = reports[getLatestReportingPeriod()];
    }

    /**
     * @dev given a unix timestamp (in seconds) return the current weekday
     * note week 0 is sunday, week 6 is saturday
     *
     * @param timestamp unix timestamp in seconds (e.g. block.timestamp)
     * @return weekday the day of week between 0 and 6 (inclusive)
     */
    function getWeekday(uint256 timestamp) public pure returns (uint8 weekday) {
        weekday = uint8((timestamp / DAY_IN_SECONDS + 4) % 7);
    }

    /**
     * @dev this function will take a timestamp and normalise it to a value.
     * By default, reports are normalised to closest start of the week, so this
     * function will help generate weekly reports
     *
     * @param timestamp is the UNIX timestamp (in seconds) e.g. the block.timestamp
     */
    function getReportPeriodFor(uint256 timestamp)
        public
        view
        virtual
        returns (uint256 reportPeriod)
    {
        uint256 currentDOW = getWeekday(timestamp);
        timestamp = (timestamp - currentDOW * DAY_IN_SECONDS);
        timestamp = timestamp - timestamp % DAY_IN_SECONDS;
        reportPeriod = timestamp;
    }

    /**
     * @dev get the latest reporting period given the block timestamp. Return a normalised value
     * based on timestamp. By default we return normalised by week
     *
     * @return reportPeriod the normalised report period for the latest timestamp
     */
    function getLatestReportingPeriod()
        public
        view
        returns (uint256 reportPeriod)
    {
        return getReportPeriodFor(block.timestamp);
    }

    /**
     * @dev grant access to selected reporter. only the owner of the report object may assign reporters
     *
     * @param reporter the address of user/contract that may update this report
     */
    function grantAccess(address reporter) public onlyOwner {
        _access[reporter] = true;
    }

    /**
     * @dev revoke access for a selected reporter. only the owner of the report may revoke reporters
     *
     * @param reporter the address of the user/contract that we are revoking access
     */
    function revokeAccess(address reporter) public onlyOwner {
        _access[reporter] = false;
    }

    modifier accessible() {
        require(
            _access[msg.sender] || owner() == msg.sender,
            "Cannot access reporting function"
        );
        _;
    }

    /**
     * @dev update a report given the period and the value. If the period is 0, then
     * the global report is updated. The sum is increased by the supplied value and the
     * count is incremented by 1
     *
     * @param period is the normalised period that we want to update.
     * @param value is the value to be added
     */
    function updateReport(uint256 period, uint256 value) private {
        ReportPeriod storage latest;
        if (period == 0) {
            latest = _overallReport;
        } else {
            latest = getLatestReportObject();
        }
        latest.count += 1;
        latest.sum += value;
    }

    /**
     * @dev update a report given the period, key and the value. If the period is 0, then
     * the global report is updated. The sum is increased by the supplied value and the
     * count is incremented by 1. The key represents one additional dimension of data recorded
     *
     * @param period the normalised period that we want to update.
     * @param key the key dimension for this report
     * @param value the value to be added
     */
    function updateReport(
        uint256 period,
        bytes memory key,
        uint256 value
    ) private {
        updateReport(period, value);
        ReportPeriod storage latest;
        if (period == 0) {
            latest = _overallReport;
        } else {
            latest = getLatestReportObject();
        }
        ReportOverview storage overview = latest.reports[key];
        if (overview.count == 0) {
            latest.keys.push(key);
        }
        overview.count += 1;
        overview.sum += value;
    }

    /**
     * @dev update a report given the period, key and category and the value. If the period is 0, then
     * the global report is updated. The sum is increased by the supplied value and the
     * count is incremented by 1. The key and category can be used to capture more fine-grain data
     * note data is rolled up to the parent
     *
     * @param period the normalised period that we want to update.
     * @param key the key dimension for this report
     * @param category the category dimension for this report
     * @param value the value to be added
     */
    function updateReport(
        uint256 period,
        bytes memory key,
        bytes memory category,
        uint256 value
    ) private {
        updateReport(period, key, value);
        ReportPeriod storage latest;
        if (period == 0) {
            latest = _overallReport;
        } else {
            latest = getLatestReportObject();
        }
        ReportOverview storage overview = latest.reports[key];
        ReportItem storage item = overview.reportItems[category];

        if (item.count == 0) {
            overview.categories.push(category);
            overview.reportItems[category] = item;
        }
        item.count += 1;
        item.sum += value;
    }

    /**
     * @dev update the latest report, and update the global report for the running total
     *
     * @param value the value to be added
     */
    function updateLatestReport(uint256 value) external accessible {
        uint256 period = getLatestReportingPeriod();
        updateReport(period, value);
        updateReport(0, value); // update global report
    }

    /**
     * @dev update the latest report, and update the global report for the running total
     *
     * @param key the key dimension for this report
     * @param value the value to be added
     */
    function updateLatestReport(bytes memory key, uint256 value)
        external
        accessible
    {
        uint256 period = getLatestReportingPeriod();
        updateReport(period, key, value);
        updateReport(0, key, value); // update global report
    }

    /**
     * @dev update the latest report, and update the global report for the running total
     *
     * @param key the key dimension for this report
     * @param category the category dimension for this report
     * @param value the value to be added
     */
    function updateLatestReport(
        bytes memory key,
        bytes memory category,
        uint256 value
    ) external accessible {
        uint256 period = getLatestReportingPeriod();
        updateReport(period, key, category, value);
        updateReport(0, key, category, value); // update global report
    }

    /**
     * @dev update the global report, this should be used if there is no intention to
     * have the report tool manage the running totals
     *
     * @param value the value to be added
     */
    function updateGlobalReport(uint256 value) external accessible {
        updateReport(0, value);
    }

    /**
     * @dev update the global report, this should be used if there is no intention to
     * have the report tool manage the running totals
     *
     * @param key the key dimension for this report
     * @param value the value to be added
     */
    function updateGlobalReport(bytes memory key, uint256 value)
        external
        accessible
    {
        updateReport(0, key, value);
    }

    /**
     * @dev update the global report, this should be used if there is no intention to
     * have the report tool manage the running totals
     *
     * @param key the key dimension for this report
     * @param category the category dimension for this report
     * @param value the value to be added
     */
    function updateGlobalReport(
        bytes memory key,
        bytes memory category,
        uint256 value
    ) external accessible {
        updateReport(0, key, category, value);
    }

    /**
     * @dev get the report for a given period. supply 0 for the argument to get the global report
     * note returns data for the next level, use the keys to query further
     *
     * @param period the period for which we want to retrieve the data
     * @return sum current accumulated sum
     * @return count current total count for the overall report
     * @return sums all the sums that have been accumulated so far
     * @return counts all the counts that have been accumulated so far
     * @return keys a list of key dimensions. sums, counts and keys have same length and indexed accordingly
     */
    function getReportForPeriod(uint256 period)
        public
        view
        returns (
            uint256 sum,
            uint256 count,
            uint256[] memory sums,
            uint256[] memory counts,
            bytes[] memory keys
        )
    {
        ReportPeriod storage report;
        if (period == 0) {
            report = _overallReport;
        } else {
            report = reports[period];
        }

        sum = report.sum;
        count = report.count;
        keys = report.keys;

        uint256[] memory sumStorage = new uint256[](keys.length);
        uint256[] memory countStorage = new uint256[](keys.length);

        for (uint256 i = 0; i < keys.length; i++) {
            sumStorage[i] = report.reports[keys[i]].sum;
            countStorage[i] = report.reports[keys[i]].count;
        }

        sums = sumStorage;
        counts = countStorage;
    }

    /**
     * @dev get the report for a given period and key dimension. supply 0 for the argument to get the global report
     * note returns data for the next level, use the keys to query further
     *
     * @param period the period for which we want to retrieve the data
     * @param key the key dimension which we want to report on
     * @return sum current accumulated sum
     * @return count current total count for the overall report
     * @return sums all the sums that have been accumulated so far
     * @return counts all the counts that have been accumulated so far
     * @return keys a list of key dimensions. sums, counts and keys have same length and indexed accordingly
     */
    function getReportForPeriod(uint256 period, bytes memory key)
        public
        view
        returns (
            uint256 sum,
            uint256 count,
            uint256[] memory sums,
            uint256[] memory counts,
            bytes[] memory keys
        )
    {
        ReportPeriod storage report;
        if (period == 0) {
            report = _overallReport;
        } else {
            report = reports[period];
        }

        ReportOverview storage reportOverview = report.reports[key];
        sum = reportOverview.sum;
        count = reportOverview.count;
        keys = reportOverview.categories;

        uint256[] memory sumStorage = new uint256[](keys.length);
        uint256[] memory countStorage = new uint256[](keys.length);

        for (uint256 i = 0; i < keys.length; i++) {
            sumStorage[i] = reportOverview.reportItems[keys[i]].sum;
            countStorage[i] = reportOverview.reportItems[keys[i]].count;
        }

        sums = sumStorage;
        counts = countStorage;
    }

    /**
     * @dev get the report for a given period and key dimension. supply 0 for the argument to get the global report
     * note returns data for the next level, use the keys to query further
     *
     * @param period the period for which we want to retrieve the data
     * @param key the key dimension which we want to report on
     * @param category the category dimension which we want to report on
     * @return sum current accumulated sum
     * @return count current total count for the overall report
     */
    function getReportForPeriod(
        uint256 period,
        bytes memory key,
        bytes memory category
    ) public view returns (uint256 sum, uint256 count) {
        ReportPeriod storage report;
        if (period == 0) {
            report = _overallReport;
        } else {
            report = reports[period];
        }

        ReportItem storage item = report.reports[key].reportItems[category];
        sum = item.sum;
        count = item.count;
    }

    /**
     * @dev get the latest report at the highest level. includes key dimension breakdown
     * note returns data for the next level, use the keys to query further
     *
     * @return sum current accumulated sum
     * @return count current total count for the overall report
     * @return sums all the sums that have been accumulated so far
     * @return counts all the counts that have been accumulated so far
     * @return keys a list of key dimensions. sums, counts and keys have same length and indexed accordingly
     */
    function getLatestReport()
        public
        view
        returns (
            uint256 sum,
            uint256 count,
            uint256[] memory sums,
            uint256[] memory counts,
            bytes[] memory keys
        )
    {
        return getReportForPeriod(getLatestReportingPeriod());
    }

    /**
     * @dev get the latest report for a key dimension
     * note returns data for the next level, use the categories to query further
     *
     * @param key the key dimension which we want to report on
     * @return sum current accumulated sum
     * @return count current total count for the overall report
     * @return sums all the sums that have been accumulated so far
     * @return counts all the counts that have been accumulated so far
     * @return keys a list of key dimensions. sums, counts and keys have same length and indexed accordingly
     */
    function getLatestReport(bytes memory key)
        public
        view
        returns (
            uint256 sum,
            uint256 count,
            uint256[] memory sums,
            uint256[] memory counts,
            bytes[] memory keys
        )
    {
        return getReportForPeriod(getLatestReportingPeriod(), key);
    }

    /**
     * @dev get the latest report for a key and category dimension
     *
     * @param key the key dimension which we want to report on
     * @return sum current accumulated sum
     * @return count current total count for the overall report
     */
    function getLatestReport(bytes memory key, bytes memory category)
        public
        view
        returns (uint256 sum, uint256 count)
    {
        return getReportForPeriod(getLatestReportingPeriod(), key, category);
    }
}

// File: contracts/ISocialGameToken.sol

pragma solidity >=0.4.22 <0.9.0;

/**
 * @title Social Change Game Token Interface
 * @notice Smart Contract developed for the Harmony One Round 2 Hackathon on Gitcoin
 * @dev An interface for token management of a single Token Registry for all Social Games
 * Used by the {SocialGame} to manage tokens issued by players of the game and make
 * games as complete
 *
 * Intended usage: Track the tickets issued for all Social Change Games
 *
 * @author victaphu
 */
interface ISocialGameToken {

    /**
     * @dev called when a participant enters a game
     * This function is intended to be called by the SocialGame
     * upon registration of a participant for the game. The result is
     * minting of the token
     */
    function enterGame(
        address player,
        string memory tokenURI_,
        uint256 gameId
    ) external returns (uint256 ticket_);


    /**
     * @dev called when a particular game is completed. 
     */
    function gameCompleted() external;
}

// File: contracts/SocialGame.sol

pragma solidity >=0.4.22 <0.9.0;









/**
 * @title Social Change Game
 * @notice Smart Contract developed for the Harmony One Round 2 Hackathon on Gitcoin
 * @dev Contract to operate the Social Game, receiving entries via deposits into
 * an escrow and releasing or cancelling the game depending on configuration.
 *
 * Contract should be created as part of the {SocialGameToken}-{createSocialGame} function.
 * It can also be created if a user transfers an ERC721 token to the {SocialGameToken} contract
 *
 * Intended usage: this contract is a standalone contract that manages business logic
 * around an escrow and the number of depositors of fixed amount of tokens. An external
 * oracle is used to determine the winner of the game, and a percentage of the escrow
 * is sent to Philantropic causes (DAO). A refund option is provided that can be triggered
 * by contract owner in cases where the social game expires or other external factors occur.
 * Refunds are pull-based meaning users must initiate a recovery of funds upon refund
 *
 * Note A game may only starts when sufficient people have endorsed it. The first game does not
 * require endorsement and is used to distribute initial SocialGameTokens.
 * Endorsement is currently configured to be optional and can be disabled by setting required
 * endorsements to 0 during contract creation
 *
 * Todo properly define appropriate tokenomics; should these tokens be deflationary?
 * See https://docs.google.com/spreadsheets/d/1QR9s4YUO7YEqH933wQlDOv62hYiRj5q-pvqEHaLnOkk/edit?usp=sharing
 * for token analytics with some assumptions
 *
 * @author victaphu
 */
contract SocialGame is Ownable, IERC721Receiver {
    using Address for address payable;

    event Participated(address participant, uint256 value);
    event Refunded(address depositor);
    event EndorsementRefunded(address endorser, uint256 tokenId);
    event BeneficiaryWithdrawn(address beneficiary);
    event PrizeClaimed(address beneficiary);
    event EndorsementFeeClaimed(address endorser, uint256 value);
    event GameCompleted(address first, address second, address third);
    event GameCancelled();
    event EndorsementReceived(address endorser, uint256 tokenId);

    // this is for the beneficiary (daoFund)
    RefundEscrow private immutable _daoEscrow;

    // this is for the winners, owned by the smart contract itself
    RefundEscrow private immutable _winnersEscrow;

    uint256 public immutable pricePerRound;
    uint256 public immutable participants;
    uint256 public immutable gameId;
    uint256 public immutable requiredEndorsers;
    address[] public receivedAddressesArray;
    bool public isGameCompleted;

    // constants for the game
    uint256 public constant PRIZE_1ST = 20;
    uint256 public constant PRIZE_2ND = 10;
    uint256 public constant PRIZE_3RD = 5;
    uint256 public constant FUNDS_DAO = 60;
    uint256 public constant ENDORSE_FEE = 5;

    address payable public winner1st;
    address payable public winner2nd;
    address payable public winner3rd;

    bool private _1stPrizeClaimed;
    bool private _2ndPrizeClaimed;
    bool private _3rdPrizeClaimed;

    ISocialGameToken private _socialGameToken;
    Report private _reporting;

    // endorsements (need 20 endorsements to start the game)
    uint256 public endorsements;

    // capture the endorsers and allow for refund if the game is cancelled
    // one address endorse only once
    mapping(address => uint256) private _endorsers;

    string public metadataURI;

    /**
     * @dev immutable configuration objects initialised in the contructor,
     * including the benefactor of the escrowed funds
     */

    constructor(
        address payable beneficiary_,
        uint256 participants_,
        uint256 pricePerRound_,
        uint256 gameId_,
        uint256 requiredEndorsers_,
        address socialGameToken_,
        address reporting_
    ) {
        require(pricePerRound_ > 0, "ER_001");
        require(participants_ > 3, "ER_002");

        _daoEscrow = new RefundEscrow(beneficiary_);
        _winnersEscrow = new RefundEscrow(payable(address(this)));
        participants = participants_;
        pricePerRound = pricePerRound_;
        gameId = gameId_;
        _socialGameToken = ISocialGameToken(socialGameToken_);
        _reporting = Report(reporting_);
        requiredEndorsers = requiredEndorsers_;
    }

    function setMetadataURI(string memory uri) public onlyOwner {
        metadataURI = uri;
    }

    /**
     * @dev pick a winner randomly and remove it from the list of participants
     */
    function pickWinner(uint256 value_)
        private
        returns (address payable winner)
    {
        // prevent the same address from being picked again by removing it
        // first we switch the last spot with the randomly selected spot, then
        // we pop the array to remove the last slot

        winner = payable(receivedAddressesArray[value_]);
        receivedAddressesArray[value_] = receivedAddressesArray[
            receivedAddressesArray.length - 1
        ];
        receivedAddressesArray.pop();
    }

    /**
     * @dev Call this on game completion to indicate game is completed and payouts
     * should start to happen
     *
     * Emits {GameCompleted} event
     */
    function gameCompleted() private {
        require(isGameComplete(), "ER_003");
        _daoEscrow.close();
        _winnersEscrow.close();
        _winnersEscrow.beneficiaryWithdraw(); // withdraw the prize to this smart contract

        bytes32 seed = vrf();
        winner1st = pickWinner(
            randomWithVRFSeed(
                receivedAddressesArray.length,
                seed,
                block.difficulty
            )
        );
        winner2nd = pickWinner(
            randomWithVRFSeed(
                receivedAddressesArray.length,
                seed,
                block.timestamp
            )
        );
        winner3rd = pickWinner(
            randomWithVRFSeed(receivedAddressesArray.length, seed, uint256(0))
        );

        _socialGameToken.gameCompleted();

        emit GameCompleted(winner1st, winner2nd, winner3rd);
    }

    /**
     * @dev create a random value using a seed (VRF) and the nounce. It is important that the
     * seed is random.
     *
     * @param maxValue_ the maximum value (used for modulo)
     * @param seed_ a random value derived from the environment
     * @param nounce_ a value that is used as a nounce to extract random values from a single seed
     * @return result random value derived from the parameters
     */
    function randomWithVRFSeed(
        uint256 maxValue_,
        bytes32 seed_,
        uint256 nounce_
    ) private pure returns (uint256 result) {
        uint256 packed = uint256(keccak256(abi.encodePacked(seed_, nounce_)));
        result = uint256(packed % maxValue_);
    }

    /**
     * @dev retrieve the number which is the VRF for each block
     * https://github.com/harmony-one/harmony/issues/3719
     *
     * @return result the VRF assocaited with the current block
     */
    function vrf() private view returns (bytes32 result) {
        bytes32 input;
        assembly {
            let memPtr := mload(0x40)
            if iszero(staticcall(not(0), 0xff, input, 32, memPtr, 32)) {
                invalid()
            }
            result := mload(memPtr)
        }
    }

    /**
     * Function returning the details of winners in one function call.
     */
    function getWinners()
        public
        view
        returns (
            address first,
            address second,
            address third,
            bool firstClaimed,
            bool secondClaimed,
            bool thirdClaimed
        )
    {
        first = winner1st;
        second = winner2nd;
        third = winner3rd;
        firstClaimed = _1stPrizeClaimed;
        secondClaimed = _2ndPrizeClaimed;
        thirdClaimed = _3rdPrizeClaimed;
    }

    /**
     * @dev Participate in the Social Game by transferring appropriate amount.
     * Increases player count and records the address that transferred
     *
     * note: Sent value must match expected price per round, gamue must still be active, and
     * msg.sender must not have already participated.
     * Funds are sent to two escrows, a daoEscrow for the DAO, and a winnersEscrow
     * for money to be claimed by the winners
     *
     * Emits a {Participated} event
     */
    function participate() external payable virtual {
        require(msg.value == pricePerRound, "ER_004");
        require(isGameCompleted == false, "ER_005");
        require(_daoEscrow.depositsOf(msg.sender) == 0, "ER_006");
        require(endorsements == requiredEndorsers, "ER_007");

        uint256 additional = 0;
        if (requiredEndorsers == 0) {
            additional = ENDORSE_FEE;
        }

        receivedAddressesArray.push(msg.sender);
        _daoEscrow.deposit{value: (msg.value * (FUNDS_DAO + additional)) / 100}(
            msg.sender
        );
        _winnersEscrow.deposit{
            value: (msg.value * (100 - (FUNDS_DAO + additional))) / 100
        }(msg.sender);

        uint256 value = _socialGameToken.enterGame(msg.sender, "", gameId);

        emit Participated(msg.sender, value);

        // update the player + game to indicate an entry to the game
        // key is address of the owner of the social game, and the game id
        _reporting.updateLatestReport(
            abi.encodePacked(gameId),
            abi.encodePacked(msg.sender),
            msg.value
        );

        // close this if the
        if (receivedAddressesArray.length == participants) {
            isGameCompleted = true;
            gameCompleted();
        }
    }

    /**
     * @dev allow user who contributed to get refund from both the daoEscrow and
     * winners escrow if the game has been cancelled
     *
     * Emits {Refunded} event
     */
    function refund() external payable virtual {
        require(isGameCancelled(), "ER_008");
        require(_winnersEscrow.depositsOf(msg.sender) > 0, "ER_009");

        _daoEscrow.withdraw(payable(msg.sender));
        _winnersEscrow.withdraw(payable(msg.sender));

        emit Refunded(msg.sender);
    }

    /**
     * @dev allow endorser to get a refund on their ticket if the game was cancelled
     *
     * Emits {EndorserRefunded} event
     */
    function refundEndorsement() external virtual {
        require(isGameCancelled(), "ER_010");
        require(_endorsers[msg.sender] > 0, "ER_011");

        uint256 token = _endorsers[msg.sender];
        _endorsers[msg.sender] = 0;

        IERC721 erc721 = IERC721(address(_socialGameToken));
        erc721.safeTransferFrom(address(this), msg.sender, token);

        emit EndorsementRefunded(msg.sender, token);
    }

    /**
     * @dev enable winners of the game to withdraw, only if the game is complete
     * and msg sender matches winner
     *
     * Emits {PrizeClaimed} event
     */
    function claimPrize() external virtual {
        require(isGameComplete(), "ER_012");
        require(
            msg.sender == winner1st ||
                msg.sender == winner2nd ||
                msg.sender == winner3rd,
            "ER_013"
        );
        require(
            (msg.sender == winner1st && _1stPrizeClaimed == false) ||
                (msg.sender == winner2nd && _2ndPrizeClaimed == false) ||
                (msg.sender == winner3rd && _3rdPrizeClaimed == false),
            "ER_014"
        );

        address payable payoutAddress = payable(msg.sender);

        if (msg.sender == winner1st) {
            _1stPrizeClaimed = true;
            payoutAddress.sendValue(
                (pricePerRound * participants * PRIZE_1ST) / 100
            );
        } else if (msg.sender == winner2nd) {
            _2ndPrizeClaimed = true;
            payoutAddress.sendValue(
                (pricePerRound * participants * PRIZE_2ND) / 100
            );
        } else {
            _3rdPrizeClaimed = true;
            payoutAddress.sendValue(
                (pricePerRound * participants * PRIZE_3RD) / 100
            );
        }

        emit PrizeClaimed(msg.sender);
    }

    /**
     * @dev enable endorsers to claim their share of the endorsement fee. Endorsement is set at 5% and endorsers share
     * in a pool once the game is completed. Must revert if not part of endorsement list, or if the game is not complete
     *
     * Emits {EndorsementFeeClaimed} event
     */
    function claimEndorsementFee() external virtual {
        require(isGameComplete(), "ER_015");
        require(requiredEndorsers > 0, "ER_016");
        require(_endorsers[msg.sender] > 0, "ER_017");

        _endorsers[msg.sender] = 0;
        address payable payoutAddress = payable(msg.sender);

        uint256 refundValue = (pricePerRound * participants * ENDORSE_FEE) /
            100 /
            requiredEndorsers;

        payoutAddress.sendValue(refundValue);

        emit EndorsementFeeClaimed(msg.sender, refundValue);
    }

    /**
     * @dev helper function to determine if the msg.sender won
     *
     * @param addr to check whether user won
     * @return won whether the msg.sender is part of the winning address set
     */
    function didIWin(address addr) external view virtual returns (bool won) {
        won = winner1st == addr || winner2nd == addr || winner3rd == addr;
    }

    /**
     * @dev enable the DAO to withdraw the funds. only if the game is complete and
     * the address of DAO matches the contructor address
     *
     * Emits {BeneficiaryWithdrawn} event
     */
    function beneficiaryWithdraw() external virtual {
        require(isGameCancelled() == false, "ER_018");
        require(msg.sender == _daoEscrow.beneficiary(), "ER_019");
        require(isGameComplete(), "ER_020");
        require(address(_daoEscrow).balance > 0, "ER_021");

        _daoEscrow.beneficiaryWithdraw();

        emit BeneficiaryWithdrawn(msg.sender);
    }

    /**
     * @dev Called when the game is cancelled. This is called by the owner
     * and allows the depositors to get their money back
     *
     * Emits {GameCancelled} event
     */
    function gameCancelled() public onlyOwner {
        require(isGameComplete() == false, "ER_022");

        _daoEscrow.enableRefunds();
        _winnersEscrow.enableRefunds();

        // even tho game was cancelled, enable NFT transfers as users paid for the gas to mint it
        _socialGameToken.gameCompleted();

        emit GameCancelled();
    }

    /**
     * @dev check if game is complete. game complete when the participants
     * required for deposits are matched
     *
     * @return gameComplete whether the game is completed
     */
    function isGameComplete() public view returns (bool gameComplete) {
        gameComplete = isGameCompleted;
    }

    /**
     * @dev check is game is cancelled. a game is cancelled by the contract
     * owner. cancelled contracts enable refunds by the
     *
     * @return isCancelled whether the game has been cancelled
     */
    function isGameCancelled() public view returns (bool isCancelled) {
        isCancelled = _daoEscrow.state() == RefundEscrow.State.Refunding;
    }

    /**
     * @dev Get total number of participants so far
     *
     * @return participants_ current number of participants
     */
    function totalParticipants() public view returns (uint256 participants_) {
        if (isGameCompleted) {
            participants_ = participants;
        } else {
            participants_ = receivedAddressesArray.length;
        }
    }

    /**
     * @dev get dao and winners escrow values for caller of this function
     *
     * @param addr address to check
     * @return daoEscrow total value in dao escrow
     * @return winnersEscrow total value in winners' escrow
     */
    function getDeposits(address addr)
        public
        view
        returns (uint256 daoEscrow, uint256 winnersEscrow)
    {
        daoEscrow = _daoEscrow.depositsOf(addr);
        winnersEscrow = _winnersEscrow.depositsOf(addr);
    }

    // function for receiving tokens
    receive() external payable {
        require(msg.sender == address(_winnersEscrow), "ER_023");
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        require(msg.sender == address(_winnersEscrow), "ER_024");
    }

    /**
     * @dev before a game begins it must be endorsed by 20 unique addresses holding a Social Game Token. They can endorse a
     * game by transferring their token into the address of the game. This function can only be called by the deployed
     * SocialGameToken contract that was used to create the game. The 20 endorsers is an arbitrary number for the purpose of
     * the hackathon, proper tokenecomics should be applied and numbers adjusted to better balance token inflation/deflation.
     *
     * Note the initial deployment of the social game token will trigger off an initial endorser offering. During this offering
     * there is no endorsement requirement for the game. This will seed the endorsers so that additional games can begin
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        require(msg.sender == address(_socialGameToken), "ER_025");
        require(_endorsers[from] == 0, "ER_026");
        require(endorsements < requiredEndorsers, "ER_027");

        _endorsers[from] = tokenId;
        endorsements = endorsements + 1;

        emit EndorsementReceived(from, tokenId);

        // receive ERC721 transfer; must be from the social game token.
        return this.onERC721Received.selector;
    }
}
