import {
  Transfer as TransferEvent,
  Token as TokenContract
} from './../generated/Token/Token'

import {
  Token, User
} from './../generated/schema'

import { ipfs, json, JSONValue } from '@graphprotocol/graph-ts'

const ipfsHash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq"

export function handleTransfer(event: TransferEvent): void {
  let token = Token.load(event.params.tokenId.toString());

  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.creator = event.params.to.toHexString();
    token.tokenID = event.params.tokenId;
    token.createdAtTimestamp = event.block.timestamp;
  }

  token.updatedAtTimestamp = event.block.timestamp;
  token.tokenURI = "/" + event.params.tokenId.toString()

  let metaData = ipfs.cat(ipfsHash + token.tokenURI);

  if (metaData) {
    const value = json.fromBytes(metaData).toObject();
    if (value) {
      const image = value.get('image')
      if (image) {
        token.image = image.toString();
      }

      let attributes: JSONValue[]
      const attr = value.get('attributes')
      if (attr) {
        attributes = attr.toArray();

        for (let i = 0; i < attributes.length; i++) {
          let item = attributes[i].toObject()

          let trait: string
          let t = item.get('trait_type')
          if (t) {
            trait = t.toString()
          }

          let value: string
          let v = item.get('value')

          if (v) {
            value = v.toString()
          }

          if (trait == "Background") {
            token.background = value
          }

          if (trait == "Mouth") {
            token.mouth = value
          }

          if (trait == "Eyes") {
            token.eyes = value
          }

          if (trait == "Hat") {
            token.hat = value
          }

          if (trait == "Fur") {
            token.fur = value
          }

        }
      }
    }
  }

  token.owner = event.params.to.toHexString();
  token.save();

  let user = User.load(event.params.to.toHexString());
  if (!user) {
    user = new User(event.params.to.toHexString());
    user.save();
  }
}