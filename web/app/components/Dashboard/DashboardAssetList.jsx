import React from "react";
import {ChainStore} from "graphenejs-lib";
import ChainTypes from "../Utility/ChainTypes";
import BindToChainState from "../Utility/BindToChainState";
import Immutable from "immutable";
import FormattedAsset from "../Utility/FormattedAsset";
import AssetName from "../Utility/AssetName";
import SettingsActions from "actions/SettingsActions";
import Icon from "../Icon/Icon";
import utils from "common/utils";
require("./DashboardAssetList.scss");

@BindToChainState()
class DashboardAssetList extends React.Component {

    static propTypes = {
        balances: ChainTypes.ChainObjectsList,
        assets: ChainTypes.ChainAssetsList
    };

    constructor() {
        super();

        this.state = {
            filter: ""
        };
    }

    shouldComponentUpdate(np, ns) {
        let balancesChanged = false;
        np.balances.forEach((a, i) => {
            if (!Immutable.is(a, this.props.balances[i])) {
                balancesChanged = true;
            }
        });

        let assetsChanged = false;
        np.assets.forEach((a, i) => {
            if (!Immutable.is(a, this.props.assets[i])) {
                assetsChanged = true;
            }
        });

        return (
            np.account !== this.props.account ||
            balancesChanged ||
            assetsChanged ||
            np.showZeroBalances !== this.props.showZeroBalances ||
            ns.filter !== this.state.filter ||
            !utils.are_equal_shallow(np.pinnedAssets, this.props.pinnedAssets)
        );
    }

    _getBalance(asset_id) {
        let currentBalance = this.props.balances.find(a => {
            return (a ? a.get("asset_type") === asset_id : false);
        });

        return (!currentBalance || currentBalance.get("balance") === 0) ? null : {amount: currentBalance.get("balance"), asset_id: asset_id};
    }

    _isPinned(asset) {
        return this.props.pinnedAssets.has(asset);
    }


    _renderRow(assetName) {
        let isPinned = this._isPinned(assetName);
        let asset = ChainStore.getAsset(assetName);

        if (!asset) {
            return null;
        }

        let balance = this._getBalance(asset.get("id"));

        if (!isPinned && (!this.props.showZeroBalances && !this.state.filter.length) && (!balance || (balance && balance.amount === 0))) {
            return null;
        }

        let imgName = asset.get("symbol").split(".");
        imgName = imgName.length === 2 ? imgName[1] : imgName[0];

        return (
            <tr key={assetName}>
                <td><img style={{maxWidth: 25}} src={"asset-symbols/"+ imgName.toLowerCase() + ".png"} /></td>
                <td><AssetName asset={assetName} name={assetName}/></td>
                <td>{balance ? <FormattedAsset hide_asset amount={balance.amount} asset={balance.asset_id} /> : "0"}</td>
                <td><a>Deposit</a> | <a>Withdraw</a></td>
                <td><a>Buy</a> | <a>Sell</a></td>
                <td className={"clickable text-center pin-column"} onClick={this._togglePin.bind(this, assetName)}>
                    <span>
                        {isPinned ?
                            <Icon className="icon-14px" name="lnr-cross"/> :
                            <Icon className="icon-14px" name="thumb-tack"/>
                        }
                    </span>
                </td>
            </tr>
        );
    }

    _toggleZeroBalance() {
        SettingsActions.changeViewSetting({showZeroBalances: !this.props.showZeroBalances});
    }

    _togglePin(asset) {
        let {pinnedAssets} = this.props;
        if (pinnedAssets.has(asset)) {
            pinnedAssets = pinnedAssets.delete(asset);
        } else {
            pinnedAssets = pinnedAssets.set(asset, true);
        }
        SettingsActions.changeViewSetting({pinnedAssets});
    }

    _onSearch(e) {
        this.setState({
            filter: e.target.value.toUpperCase()
        });
    }

    render() {
        let assets = this.props.assetNames;
        // console.log("account:", this.props.account.toJS(), "balances:", this.props.balances);
        return (
            <div>
                <h3>Wallet</h3>

                <div style={{paddingTop: 20}}>
                    <input onChange={this._toggleZeroBalance.bind(this)} checked={!this.props.showZeroBalances && !this.state.filter.length} type="checkbox" />
                    <label style={{position: "relative", top: -3}} onClick={this._toggleZeroBalance.bind(this)}>Hide 0 balances</label>

                    <div className="float-right">
                        <div style={{position: "relative", top: -13}}>
                        <input onChange={this._onSearch.bind(this)} value={this.state.filter} style={{marginBottom: 0, }} type="text" placeholder="Find an asset" />
                        <span className="clickable" style={{position: "absolute", top: 12, right: 10, color: "black"}} onClick={() => {this.setState({filter: ""})}}>X</span>
                        </div>
                    </div>
                </div>
                <div>
                    <table className="table" style={{maxHeight: 800}}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Asset</th>
                                <th>Value</th>
                                <th>Transfer actions</th>
                                <th>Trade actions</th>
                                <th style={{textAlign: "center"}}>Pinned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.filter(a => a.indexOf(this.state.filter) !== -1).map(a => this._renderRow(a))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

@BindToChainState()
export default class ListWrapper extends React.Component {

    static propTypes = {
        account: ChainTypes.ChainAccount.isRequired
    };

    _getAssets() {
        return [
            'BROWNIE.PTS',
            'BTS',
            'BTSR',
            'GRIDCOIN',
            'ICOO',
            'OBITS',
            'OPEN.ARDR',
            'OPEN.BTC',
            'OPEN.DASH',
            'OPEN.DGD',
            'OPEN.DOGE',
            'OPEN.ETH',
            'OPEN.EUR',
            'OPEN.EURT',
            'OPEN.GAME',
            'OPEN.GRC',
            'OPEN.HEAT',
            'OPEN.LISK',
            'OPEN.LTC',
            'OPEN.MAID',
            'OPEN.MUSE',
            'OPEN.OMNI',
            'OPEN.MKR',
            'OPEN.INCNT',
            'OPEN.STEEM',
            'OPEN.USD',
            'OPEN.USDT',
            'OPEN.NXC',
            'PEERPLAYS',
            'SHAREBITS',
            'SOLCERT'
        ]
    }

    render() {

        let balances = this.props.account.get("balances").map((a, key) => {
            return a;
        }).toArray();

        let assets = this._getAssets();

        return (
            <DashboardAssetList
                balances={Immutable.List(balances)}
                assetNames={assets}
                assets={Immutable.List(assets)}
                {...this.props}
            />
        );
    }
}
