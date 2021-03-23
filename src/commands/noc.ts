import {Command, flags} from '@oclif/command'

export default class Noc extends Command {

  static hidden = true

  static flags = {
    accessToken: flags.string({
      required: false,
      hidden: true,
    }),
  }

  async run() {

    this.log('-= NoC =-')

    const { flags } = this.parse(Noc)
    this.log(flags.accessToken)

  }

}