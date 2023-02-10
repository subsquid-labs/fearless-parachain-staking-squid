import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Round} from "./round.model"
import {RoundCollator} from "./roundCollator.model"
import {RoundNominator} from "./roundNominator.model"

@Entity_()
export class RoundNomination {
    constructor(props?: Partial<RoundNomination>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Round, {nullable: true})
    round!: Round

    @Index_()
    @ManyToOne_(() => RoundCollator, {nullable: true})
    collator!: RoundCollator

    @Index_()
    @ManyToOne_(() => RoundNominator, {nullable: true})
    nominator!: RoundNominator

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint
}
